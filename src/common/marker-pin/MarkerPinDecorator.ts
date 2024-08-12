import { BeButton, BeButtonEvent, Cluster, DecorateContext, Decorator, IModelApp, Marker, MarkerSet } from "@itwin/core-frontend";
import { Point2d, Point3d, Range1dProps, XAndY, XYAndZ } from "@itwin/core-geometry";
import { PopupMenu, PopupMenuEntry } from "./PopupMenu";

export interface MarkerData {
  point: Point3d;
  title?: string;
  description?: string;
  data?: any;
}

/** Shows a pin marking the location of a point. */
class SamplePinMarker<T extends MarkerData> extends Marker {
  private _markerSet: SampleMarkerSet<T>;
  public data: any;
  public toolTipTitle: string;
  public toolTipDescription: string;
  private static _height = 35;
  private _onMouseButtonCallback?: any;

  /** Create a new SamplePinMarker */
  constructor(markerData: T, title: string, description: string, image: HTMLImageElement, markerSet: SampleMarkerSet<T>, scale: Range1dProps = { low: .75, high: 2.0 }, onMouseButtonCallback?: any) {
    super(markerData.point, new Point2d(image.width * (SamplePinMarker._height / image.height), SamplePinMarker._height));

    this.setImage(image);
    this.imageOffset = new Point3d(0, Math.floor(this.size.y * .5));

    this._onMouseButtonCallback = onMouseButtonCallback;
    this._markerSet = markerSet;
    this.data = markerData.data;

    let tooltip = "";
    if (markerData.title) {
      this.toolTipTitle = markerData.title;
      this.toolTipDescription = markerData.description ? markerData.description : "";
      tooltip = markerData.title;
      if (markerData.description) {
        tooltip += `<br>${markerData.description}`;
      }
    } else {
      this.toolTipTitle = title;
      this.toolTipDescription = description ? description : "";
      tooltip = title;
      if (description) {
        tooltip += `<br>${description}`;
      }
    }
    const div = document.createElement("div");
    div.innerHTML = tooltip;
    this.title = div;

    this.setScaleFactor(scale);
  }

  public pick(pt: XAndY): boolean {
    if (undefined === this.imageOffset)
      return super.pick(pt);

    const pickRect = this.rect.clone();
    const offsetX = (undefined === this._scaleFactor ? this.imageOffset.x : this.imageOffset.x * this._scaleFactor.x);
    const offsetY = (undefined === this._scaleFactor ? this.imageOffset.y : this.imageOffset.y * this._scaleFactor.y);
    pickRect.top -= offsetY;
    pickRect.bottom -= offsetY;
    pickRect.left -= offsetX;
    pickRect.right -= offsetX;
    return pickRect.containsPoint(pt);
  }

  public onMouseButton(ev: BeButtonEvent): boolean {
    if (BeButton.Data !== ev.button || !ev.isDown || !ev.viewport || !ev.viewport.view.isSpatialView())
      return true;

    if (this._onMouseButtonCallback) {
      this._onMouseButtonCallback(this.data);
      return true;
    }

    this.showPopupMenu({ x: ev.viewPoint.x, y: ev.viewPoint.y });
    return true;
  }

  private showPopupMenu(cursorPoint: XAndY) {
    const menuEntries: PopupMenuEntry[] = [];

    menuEntries.push({ label: "Center View", onPicked: this._centerMarkerCallback });
    menuEntries.push({ label: "Remove Marker", onPicked: this._removeMarkerCallback });

    menuEntries.push({
      label: "显示停车场信息",
      onPicked: this._showParkingLotInfo
    });

    menuEntries.push({
      label: "占用一个车位",
      onPicked: this._occupyParkingSpot
    });

    menuEntries.push({
      label: "取消占用车位",
      onPicked: this._releaseParkingSpot
    });

    const offset = 8;
    PopupMenu.onPopupMenuEvent.emit({
      menuVisible: true,
      menuX: cursorPoint.x - offset,
      menuY: cursorPoint.y - offset,
      entries: menuEntries,
    });
  }

  private _showParkingLotInfo = (_entry: PopupMenuEntry) => {
    this._markerSet.displayParkingLotInfo(this.data);
  };

  private _occupyParkingSpot = async (_entry: PopupMenuEntry) => {
    await this._markerSet.occupyParkingSpot(this.data);
  };

  private _releaseParkingSpot = async (_entry: PopupMenuEntry) => {
    await this._markerSet.releaseParkingSpot(this.data);
  };

  private _removeMarkerCallback = (_entry: PopupMenuEntry) => {
    this._markerSet.removeMarker(this);
  };

  private _centerMarkerCallback = (_entry: PopupMenuEntry) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined !== vp) {
      vp.zoom(this.worldLocation, 1.0, { animateFrustumChange: true });
    }
  };
}

class SampleClusterMarker<T extends MarkerData> extends Marker {
  private static _radius = 13;
  private _cluster: Cluster<SamplePinMarker<T>>;
  private _onMouseButtonCallback?: any;

  constructor(location: XYAndZ, size: XAndY, cluster: Cluster<SamplePinMarker<T>>, onMouseButtonCallback?: any) {
    super(location, size);

    this._onMouseButtonCallback = onMouseButtonCallback;
    this._cluster = cluster;

    this.label = cluster.markers.length.toLocaleString();
    this.labelColor = "black";
    this.labelFont = "bold 14px san-serif";

    const maxLen = 10;
    let title = "";
    cluster.markers.forEach((marker, index: number) => {
      if (index < maxLen) {
        if (index === 0)
          title += marker.toolTipTitle;
        if (marker.toolTipDescription === undefined || marker.toolTipDescription.length === 0)
          title += `<br>${marker.toolTipTitle}`;
        else
          title += `<br>${marker.toolTipDescription}`;
      }
    });
    if (cluster.markers.length > maxLen)
      title += "<br>...";

    const div = document.createElement("div");
    div.innerHTML = title;
    this.title = div;
  }

  public onMouseButton(ev: BeButtonEvent): boolean {
    if (BeButton.Data !== ev.button || !ev.isDown || !ev.viewport || !ev.viewport.view.isSpatialView())
      return true;

    if (this._onMouseButtonCallback)
      this._onMouseButtonCallback(this._cluster.markers[0].data);

    return true;
  }

  public drawFunc(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = "#372528";
    ctx.fillStyle = "white";
    ctx.lineWidth = 5;
    ctx.arc(0, 0, SampleClusterMarker._radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

class SampleMarkerSet<T extends MarkerData> extends MarkerSet<SamplePinMarker<T>> {
  public minimumClusterSize = 5;
  private _onMouseButtonCallback?: any;

  protected getClusterMarker(cluster: Cluster<SamplePinMarker<T>>): Marker {
    return SampleClusterMarker.makeFrom(cluster.markers[0], cluster, this._onMouseButtonCallback);
  }

  public setMarkersData(markersData: T[], image: HTMLImageElement, onMouseButtonCallback?: any): void {
    this.markers.clear();
    this._onMouseButtonCallback = onMouseButtonCallback;

    let index = 1;
    for (const markerData of markersData) {
      this.markers.add(new SamplePinMarker(markerData, `Marker ${index++}`, ``, image, this, undefined, onMouseButtonCallback));
    }
  }

  public removeMarker(marker: SamplePinMarker<T>) {
    this.markers.delete(marker);

    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }

  public clear() {
    this.markers.clear();
  }

  public displayParkingLotInfo(markerData: T) {
    if (this._onMouseButtonCallback) {
      this._onMouseButtonCallback({
        type: "DISPLAY_INFO",
        data: markerData,
      });
    }
  }

  public async occupyParkingSpot(markerData: T) {
    if (this._onMouseButtonCallback) {
      this._onMouseButtonCallback({
        type: "OCCUPY_SPOT",
        data: markerData,
      });
    }
  }

  public async releaseParkingSpot(markerData: T) {
    if (this._onMouseButtonCallback) {
      this._onMouseButtonCallback({
        type: "RELEASE_SPOT",
        data: markerData,
      });
    }
  }
}

export class MarkerPinDecorator<T extends MarkerData> implements Decorator {
  private _autoMarkerSet = new SampleMarkerSet<T>();
  private _manualMarkerSet = new SampleMarkerSet<T>();

  public displayParkingLotInfo?: (markerData: T) => void;
  public occupyParkingSpot?: (markerData: T) => Promise<void>;
  public releaseParkingSpot?: (markerData: T) => Promise<void>;

  public setMarkersData(markersData: T[], pinImage: HTMLImageElement, onMouseButtonCallback?: any): void {
    this._autoMarkerSet.setMarkersData(markersData, pinImage, onMouseButtonCallback);

    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }

  public addPoint(point: Point3d, pinImage: HTMLImageElement): void {
    const markerData: T = { point } as T;
    this._manualMarkerSet.markers.add(new SamplePinMarker(markerData, "Manual", "", pinImage, this._manualMarkerSet));

    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }

  public addMarkerPoint(markerData: T, pinImage: HTMLImageElement, title?: string, description?: string, scale?: Range1dProps, onMouseButtonCallback?: any): void {
    this._manualMarkerSet.markers.add(new SamplePinMarker(markerData, title ?? "Manual", description ?? "description test goes here", pinImage, this._manualMarkerSet, scale, onMouseButtonCallback));

    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }

  public clearMarkers() {
    this._manualMarkerSet.markers.clear();

    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }

  public decorate(context: DecorateContext): void {
    if (!this._autoMarkerSet.viewport) {
      this._autoMarkerSet.changeViewport(context.viewport);
    }

    if (!this._manualMarkerSet.viewport) {
      this._manualMarkerSet.changeViewport(context.viewport);
    }

    if (context.viewport.view.isSpatialView()) {
      this._autoMarkerSet.addDecoration(context);
      this._manualMarkerSet.addDecoration(context);
    }
  }
}
