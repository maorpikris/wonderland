import { Entity, Column, PrimaryColumn } from 'typeorm';
import { CameraType } from '@/enum/enums';
import * as GeoJSON from 'geojson';

@Entity('cameras')
export class CameraEntity {
  @PrimaryColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column()
  ip: string;

  @Column({
    type: 'enum',
    enum: CameraType,
  })
  type: CameraType;

  @Column()
  username: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: 80 })
  onvifPort: number;

  @Column({ default: 554 })
  videoPort: number;

  @Column({ type: 'float', nullable: true })
  initialAzimuth?: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  position?: GeoJSON.Point;
}
