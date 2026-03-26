import { Point } from 'geojson';
import { DeviceHealthStatusEnum, RadarType } from '@/enum';

export type RasRadarDto = {
  id: string;
  name: string;
  position: Point;
  type: RadarType;
  health: DeviceHealthStatusEnum;
};

export type RadarWithType = {
  name: string;
  type: RadarType;
};
