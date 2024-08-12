/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";
import { Point3d } from "@itwin/core-geometry";
import { MarkerData, MarkerPinDecorator } from "../common/marker-pin/MarkerPinDecorator";

export default class MarkerPinApi {
  public static _images: Map<string, HTMLImageElement>;

  public static setupDecorator<T extends MarkerData>() {
    return new MarkerPinDecorator<T>();
  }

  public static setMarkersData<T extends MarkerData>(decorator: MarkerPinDecorator<T>, markersData: T[]) {
    const pinImage = MarkerPinApi._images.get("pin_google_maps.svg");

    if (!pinImage)
      return;

    decorator.setMarkersData(markersData, pinImage);
  }

  public static addMarkerPoint<T extends MarkerData>(decorator: MarkerPinDecorator<T>, point: Point3d, pinImage: HTMLImageElement) {
    decorator.addPoint(point, pinImage);
  }

  public static enableDecorations<T extends MarkerData>(decorator: MarkerPinDecorator<T>) {
    if (!IModelApp.viewManager.decorators.includes(decorator))
      IModelApp.viewManager.addDecorator(decorator);
  }

  public static disableDecorations<T extends MarkerData>(decorator: MarkerPinDecorator<T>) {
    IModelApp.viewManager.dropDecorator(decorator);
  }
}
