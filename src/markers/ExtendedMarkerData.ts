import { MarkerData } from "../common/marker-pin/MarkerPinDecorator";

export interface ExtendedMarkerData extends MarkerData {
  id: string;           // 使用 VARCHAR 类型的 id
  label: string;        // 停车场的标签
  capacity: number;     // 停车场的总容量
  available: number;    // 停车场的可用停车位数量
  longitude: number;    // 停车场中心的经度
  latitude: number;     // 停车场中心的纬度
}
