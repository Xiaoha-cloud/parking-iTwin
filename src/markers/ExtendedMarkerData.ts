import { MarkerData } from "../common/marker-pin/MarkerPinDecorator";

export interface ExtendedMarkerData extends MarkerData {
    id: number; 
    longitude: number;
    latitude: number;
    label: string; 
    capacity: number;
    available: number; 
  }
  