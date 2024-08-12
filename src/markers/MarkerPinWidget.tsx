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

const MarkerPinWidget: React.FC = () => {
  const viewport = useActiveViewport();
  const [imagesLoadedState, setImagesLoadedState] = useState<boolean>(false);
  const [showDecoratorState, setShowDecoratorState] = useState<boolean>(true);
  const [markersDataState, setMarkersDataState] = useState<ExtendedMarkerData[]>([]);
  const [markerPinDecorator] = useState<MarkerPinDecorator<ExtendedMarkerData>>(() => MarkerPinApi.setupDecorator());

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

  useEffect(() => {
    if (imagesLoadedState) {
      IModelApp.localization.registerNamespace('marker-pin-i18n-namespace');
      PlaceMarkerTool.register('marker-pin-i18n-namespace');
      MarkerPinApi.setMarkersData(markerPinDecorator, markersDataState);

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
  }, [imagesLoadedState]);

  useEffect(() => {
    if (showDecoratorState) {
      MarkerPinApi.enableDecorations(markerPinDecorator);
    } else {
      MarkerPinApi.disableDecorations(markerPinDecorator);
    }
  }, [showDecoratorState]);

  useEffect(() => {
    MarkerPinApi.setMarkersData(markerPinDecorator, markersDataState);
  }, [markersDataState]);

  useEffect(() => {
    const fetchData = async () => {
      if (viewport) {
        const convertToSpatial = async (val: { long: number; lat: number }) => {
          const cart = Cartographic.fromDegrees({ latitude: val.lat, longitude: val.long, height: 0 });
          return await viewport.iModel.cartographicToSpatial(cart);
        };

        const updateMarkers = async (arr: any[]) => {
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
                longitude: pos.longitude,
                latitude: pos.latitude
              });
            }
            setMarkersDataState(markersData);
          }
        };

        const { data, error } = await supabase.from('parkinglot').select('id, longitude, latitude, capacity, available, label');
        if (error) {
          console.error('Error fetching markers:', error);
        } else {
          await updateMarkers(data);
        }

        const subscription = supabase
          .channel('table_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'parkinglot' }, (payload) => {
            console.warn('Data channel from Supabase has been updated', payload);
            updateMarkers([...markersDataState, payload.new]);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      }
    };

    fetchData().catch(console.error);
  }, [markersDataState, viewport]);

  const displayParkingLotInfo = (markerData: ExtendedMarkerData) => {
    console.log(`停车场 ${markerData.label}: 总容量: ${markerData.capacity}, 可用车位: ${markerData.available}`);
  };

  const occupyParkingSpot = async (markerData: ExtendedMarkerData) => {
    const { longitude, latitude } = markerData;
    const newLongitude = longitude + (Math.random() - 0.5) * 0.0001;
    const newLatitude = latitude + (Math.random() - 0.5) * 0.0001;

    const { error } = await supabase
      .from('parkingspot')
      .insert([
        {
          longitude: newLongitude,
          latitude: newLatitude,
          status: 'occupied',
          parkinglot_id: markerData.id,
          label: `Spot near ${markerData.label}`
        },
      ]);

    if (error) {
      console.error('Error occupying parking spot:', error);
    } else {
      console.log('Parking spot occupied successfully.');
    }
  };

  const releaseParkingSpot = async (markerData: ExtendedMarkerData) => {
    const { data, error } = await supabase
      .from('parkingspot')
      .select('id')
      .eq('parkinglot_id', markerData.id)
      .eq('status', 'occupied')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching parking spot:', error);
      return;
    }

    if (data && data.length > 0) {
      const spotId = data[0].id;

      const { error: deleteError } = await supabase
        .from('parkingspot')
        .delete()
        .eq('id', spotId);

      if (deleteError) {
        console.error('Error releasing parking spot:', deleteError);
      } else {
        console.log('Parking spot released successfully.');
      }
    } else {
      console.log('No occupied parking spots found to release.');
    }
  };

  useEffect(() => {
    markerPinDecorator.displayParkingLotInfo = displayParkingLotInfo;
    markerPinDecorator.occupyParkingSpot = occupyParkingSpot;
    markerPinDecorator.releaseParkingSpot = releaseParkingSpot;
  }, [markerPinDecorator]);

  const handleMarkerClick = (markerData: ExtendedMarkerData, e: React.MouseEvent) => {
    const menuEntries: PopupMenuEntry[] = [
      {
        label: `停车场 ${markerData.label}`,
        onPicked: () => displayParkingLotInfo(markerData)
      },
      {
        label: "占用一个车位",
        onPicked: () => occupyParkingSpot(markerData)
      },
      {
        label: "取消占用车位",
        onPicked: () => releaseParkingSpot(markerData)
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
