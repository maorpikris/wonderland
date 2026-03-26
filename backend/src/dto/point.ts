import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Point } from 'geojson';


export class PointDto implements Point {
  @ApiProperty({ description: 'The GeoJSON type. Always "Point"', example: 'Point', enum: ['Point'] })
  @IsString()
  type: 'Point';

  @ApiProperty({
    description: 'Coordinates in [longitude, latitude, altitude] format',
    example: [34.7818, 32.0853, 10],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: [number, number, number];
}