import React, { useEffect, useState } from 'react';
import { StagePanelLocation, UiItemsProvider, useActiveViewport, WidgetState, Widget, StagePanelSection } from '@itwin/appui-react';
import { imageElementFromUrl, IModelApp } from '@itwin/core-frontend';
import { Alert, ToggleSwitch } from '@itwin/itwinui-react';
import { MarkerPinDecorator } from '../common/marker-pin/MarkerPinDecorator';
import { PlaceMarkerTool } from '../common/marker-pin/PlaceMarkerTool';
import { PopupMenu, PopupMenuEntry } from '../common/marker-pin/PopupMenu';
import MarkerPinApi from './MarkerPinApi';
import './MarkerPin.scss';
import supabase from '../db/db';
import { Cartographic } from '@itwin/core-common';
import { ExtendedMarkerData } from './ExtendedMarkerData';
import { Point3d } from '@itwin/core-geometry';

const MarkerPinWidget: React.FC = () => {
  const viewport = useActiveViewport();
  const [imagesLoadedState, setImagesLoadedState] = useState<boolean>(false);
  const [showDecoratorState, setShowDecoratorState] = useState<boolean>(true);
  const [markersDataState, setMarkersDataState] = useState<ExtendedMarkerData[]>([]);
  const [markerPinDecorator] = useState<MarkerPinDecorator>(() => MarkerPinApi.setupDecorator());

  useEffect(() => {
    MarkerPinApi._images = new Map();
    const loadImages = async () => {
      const p1 = imageElementFromUrl('pin_google_maps.svg');
      const p2 = imageElementFromUrl('pin_celery.svg');
      const p3 = imageElementFromUrl('pin_poloblue.svg');
      const [img1, img2, img3] = await Promise.all([p1, p2, p3]);
      MarkerPinApi._images.set('pin_google_maps.svg', img1);
      MarkerPinApi._images.set('pin_celery.svg', img2);
      MarkerPinApi._images.set('pin_poloblue.svg', img3);
      setImagesLoadedState(true);
    };
    loadImages().catch(console.error);
  }, []);

  useEffect(() => {
    MarkerPinApi.enableDecorations(markerPinDecorator);
    return () => {
      MarkerPinApi.disableDecorations(markerPinDecorator);
    };
  }, [markerPinDecorator]);

  const handleMarkerClick = (markerData: ExtendedMarkerData, e: React.MouseEvent) => {
    // 验证: 输出点击的标记名称和对应的停车场名称
    console.log(`Clicked Marker: ${markerData.label}, Expected Label: Parking Lot ${markerData.label}`);

    const menuEntries: PopupMenuEntry[] = [
      {
        label: `Parking Lot ${markerData.label}`,
        onPicked: () => alert(`Total Capacity: ${markerData.capacity}\nAvailable: ${markerData.available}`)
      },
      {
        label: 'Occupy Spot',
        onPicked: () => handleOccupySpot(markerData)
      },
      {
        label: 'Cancel Occupy Spot',
        onPicked: () => handleCancelOccupySpot(markerData)
      },
    ];

    PopupMenu.onPopupMenuEvent.emit({
      menuVisible: true,
      menuX: e.clientX,
      menuY: e.clientY,
      entries: menuEntries,
    });
  };
  const viewInit = () => {
    if (!viewport) return;
  };

  useEffect(() => {
    if (imagesLoadedState) {
      IModelApp.localization.registerNamespace('marker-pin-i18n-namespace');
      PlaceMarkerTool.register('marker-pin-i18n-namespace');
      MarkerPinApi.setMarkersData(markerPinDecorator, markersDataState, handleMarkerClick);
  
      if (viewport) {
        viewInit();
      } else {
        IModelApp.viewManager.onViewOpen.addOnce(() => viewInit());
      }
  
      return () => {
        IModelApp.localization.unregisterNamespace('marker-pin-i18n-namespace');
        IModelApp.tools.unRegister(PlaceMarkerTool.toolId);
      };
    }
  }, [handleMarkerClick, imagesLoadedState, markerPinDecorator, markersDataState, viewInit, viewport]);
  

  useEffect(() => {
    if (showDecoratorState) {
      MarkerPinApi.enableDecorations(markerPinDecorator);
    } else {
      MarkerPinApi.disableDecorations(markerPinDecorator);
    }
  }, [markerPinDecorator, showDecoratorState]);

  useEffect(() => {
    MarkerPinApi.setMarkersData(markerPinDecorator, markersDataState);
  }, [markerPinDecorator, markersDataState]);

  

  const convertToSpatial = async (val: { long: number; lat: number }): Promise<Point3d> => {
    const cart = Cartographic.fromDegrees({ latitude: val.lat, longitude: val.long, height: 0 });
    if (viewport) {
      return await viewport.iModel.cartographicToSpatial(cart);
    }
    throw new Error("Viewport not available");
  };

  const fetchData = async () => {
    if (viewport) {
      const updateMarkers = async (arr: ExtendedMarkerData[]) => {  // 明确指定类型
        if (arr) {
          const markersData: ExtendedMarkerData[] = [];
          for (const pos of arr) {
            const point = await convertToSpatial({ long: pos.longitude, lat: pos.latitude });
            markersData.push({
              point,
              id: pos.id,
              label: pos.label,
              capacity: pos.capacity,
              available: pos.available,
              longitude: 0,
              latitude: 0
            });
          }
  
          // 对 markersData 进行排序，确保按 label 排序
          markersData.sort((a, b) => a.label.localeCompare(b.label));
  
          setMarkersDataState(markersData);
        }
      };
  
      const { data, error } = await supabase
        .from('parkinglot')
        .select('id, longitude, latitude, capacity, available, label')
        .order('label', { ascending: true });
  
      if (error) {
        console.error('Error fetching markers:', error);
      } else {
        await updateMarkers(data as ExtendedMarkerData[]);  // 添加类型断言
      }
  
      const subscription = supabase
        .channel('table_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'parkinglot' }, async (payload) => {
          console.warn('Data channel from Supabase has been updated', payload);
  
          // 在更新数据时，先将新数据合并到现有数据中，然后进行排序
          const updatedData = [...markersDataState, payload.new as ExtendedMarkerData];  // 添加类型断言
  
          // 对合并后的数据进行排序
          updatedData.sort((a, b) => a.label.localeCompare(b.label));
  
          await updateMarkers(updatedData);
        })
        .subscribe();
  
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  };
  
  

  useEffect(() => {
    fetchData().catch(console.error);
  }, [markersDataState, viewport]);

  const handleOccupySpot = async (markerData: ExtendedMarkerData) => {
    const offset = 0.0001;
    const randomOffsetLongitude = (Math.random() - 0.5) * offset;
    const randomOffsetLatitude = (Math.random() - 0.5) * offset;
    const newLongitude = markerData.point.x + randomOffsetLongitude;
    const newLatitude = markerData.point.y + randomOffsetLatitude;
  
    const { data: existingSpots, error: fetchError } = await supabase
        .from('parkingspot')
        .select('label')
        .eq('parkinglot_id', markerData.id);
  
    if (fetchError) {
        console.error('Error fetching existing spots:', fetchError);
        return;
    }
  
    const existingLabels = existingSpots.map(spot => spot.label);
    let newLabel = '';
    for (let i = 1; i <= markerData.capacity; i++) {
        const labelCandidate = `${markerData.label}${i.toString().padStart(2, '0')}`;
        if (!existingLabels.includes(labelCandidate)) {
            newLabel = labelCandidate;
            break;
        }
    }
  
    if (!newLabel) {
        console.error('No available spot label found');
        return;
    }
  
    const { error: insertError } = await supabase.from('parkingspot').insert({
        id: newLabel,  // Use the generated label as the id
        longitude: newLongitude,
        latitude: newLatitude,
        status: 'occupied',
        parkinglot_id: markerData.id,
        label: newLabel,
    });
  
    if (insertError) {
        console.error('Error occupying spot:', insertError);
    } else {
        console.log('Spot occupied successfully');
        await fetchData(); // 刷新数据
    }
  };

  const handleCancelOccupySpot = async (markerData: ExtendedMarkerData) => {
    const { data: spots, error } = await supabase
      .from('parkingspot')
      .select('id')
      .eq('parkinglot_id', markerData.id)
      .eq('status', 'occupied')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching spot:', error);
      return;
    }

    if (spots && spots.length > 0) {
      const spotId = spots[0].id;
      const { error: deleteError } = await supabase.from('parkingspot').delete().eq('id', spotId);
      if (deleteError) {
        console.error('Error canceling occupy:', deleteError);
      } else {
        console.log('Occupy canceled successfully');
        await fetchData(); // 刷新数据
      }
    } else {
      console.log('No occupied spot found to cancel');
    }
  };






  return (
    <div className="sample-options">
      <ToggleSwitch
        className="show-markers"
        label="Show markers"
        labelPosition="right"
        checked={showDecoratorState}
        onChange={() => setShowDecoratorState(!showDecoratorState)}
      />
      <Alert type="informational" className="instructions">
        Use the options to control the marker pins. Click a marker to open a menu of options.
      </Alert>
      {markersDataState.map((markerData, index) => (
        <div
          key={index}
          onClick={(e) => handleMarkerClick(markerData, e)}
        >
          <PopupMenu
            key={index}
            canvas={viewport?.canvas}
          />
        </div>
      ))}
    </div>
  );
};

export class MarkerPinWidgetProvider implements UiItemsProvider {
  public readonly id = 'MarkerPinWidgetProvider';

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    _section?: StagePanelSection
  ): ReadonlyArray<Widget> {
    const widgets: Widget[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push({
        id: 'MarkerPinWidget',
        label: 'Marker Pin Selector',
        defaultState: WidgetState.Open,
        content: <MarkerPinWidget />,
      });
    }
    return widgets;
  }
}
