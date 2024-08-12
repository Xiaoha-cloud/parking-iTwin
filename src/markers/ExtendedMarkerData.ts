import { MarkerData } from "../common/marker-pin/MarkerPinDecorator";

export interface ExtendedMarkerData extends MarkerData {
    id: number; 
    label: string; 
    capacity: number;
    available: number; 
  }
  