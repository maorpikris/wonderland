import type { Point } from 'geojson';

export interface Camera {
  id: string;
  name: string;
  type?: string;
  position?: Point;
  initialAzimuth?: number;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  hasThermal?: boolean;
}
