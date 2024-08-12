import React, { useEffect, useState } from 'react';
import { StagePanelLocation, UiItemsProvider, useActiveViewport, WidgetState, Widget, StagePanelSection } from '@itwin/appui-react';
import { imageElementFromUrl, IModelApp } from '@itwin/core-frontend';
import { Alert, ToggleSwitch } from '@itwin/itwinui-react';
import { MarkerPinDecorator } from '../common/marker-pin/MarkerPinDecorator';
import { PlaceMarkerTool } from '../common/marker-pin/PlaceMarkerTool';
import { PopupMenu, PopupMenuEvent, PopupMenuEntry } from '../common/marker-pin/PopupMenu';  // 导入 PopupMenu 和相关类
import MarkerPinApi from './MarkerPinApi';
import './MarkerPin.scss';
import supabase from '../db/db'; // Supabase client
import { Cartographic } from '@itwin/core-common';
import { ExtendedMarkerData } from './ExtendedMarkerData'; // 导入扩展接口

const MarkerPinWidget: React.FC = () => {
  const viewport = useActiveViewport();
  const [imagesLoadedState, setImagesLoadedState] = useState<boolean>(false);
  const [showDecoratorState, setShowDecoratorState] = useState<boolean>(true);
  const [markersDataState, setMarkersDataState] = useState<ExtendedMarkerData[]>([]); // 使用 ExtendedMarkerData
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
            const markersData: ExtendedMarkerData[] = []; // 使用 ExtendedMarkerData
            for (const pos of arr) {
              const point = await convertToSpatial({ long: pos.longitude, lat: pos.latitude });
              markersData.push({
                point,
                id: pos.id,  // 保存 ID
                label: pos.label,  // 保存标签
                capacity: pos.capacity,  // 保存容量
                available: pos.available  // 保存剩余车位数
              });
            }
            setMarkersDataState(markersData);
          }
        };

        // 从 Supabase 获取初始数据
        const { data, error } = await supabase.from('parkinglot').select('id, longitude, latitude, capacity, available, label');
        if (error) {
          console.error('Error fetching markers:', error);
        } else {
          await updateMarkers(data);
        }

        // 实时订阅 Supabase 数据变化
        const subscription = supabase
          .channel('table_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'parkinglot' }, (payload) => {
            console.warn('Data channel from Supabase has been updated', payload);
            updateMarkers([...markersDataState, payload.new]);
          })
          .subscribe();

        // 组件卸载时清理订阅
        return () => {
          supabase.removeChannel(subscription);
        };
      }
    };

    fetchData().catch(console.error);
  }, [markersDataState, viewport]);

  const handleMarkerClick = (markerData: ExtendedMarkerData, e: React.MouseEvent) => { // 使用 ExtendedMarkerData
    const menuEntries: PopupMenuEntry[] = [
      {
        label: `停车场 ${markerData.label}`,
        onPicked: () => alert(`总容量: ${markerData.capacity}\n剩余容量: ${markerData.available}`)
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
