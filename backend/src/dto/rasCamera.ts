import { Point } from 'geojson';
import { DeviceHealthStatusEnum } from '@/enum';

export type RasCameraDto = {
  id: string;
  name: string;
  position: Point;
  azimuth: number;
  elevation: number;
  health: DeviceHealthStatusEnum;
  visualStream?: string;
  thermalStream?: string;
};

export type RasCamerasId = string;
