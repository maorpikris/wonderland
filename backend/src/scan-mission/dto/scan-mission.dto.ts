import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PointDto } from '../../dto/point';

export class CreatePhaseDto {
  @ApiProperty({ description: 'Name of the phase', example: 'Main Gate' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Order of execution', example: 0 })
  @IsNumber()
  order: number;

  @ApiProperty({ description: 'Position for this phase', type: PointDto })
  @ValidateNested()
  @Type(() => PointDto)
  position: PointDto;

  @ApiProperty({ description: 'Duration in seconds', example: 30 })
  @IsNumber()
  duration: number;
}

export class PhaseDto extends CreatePhaseDto {
  @ApiProperty({ description: 'Unique identifier for the phase', example: 'phase-1' })
  @IsString()
  id: string;
}

export class CreateScanMissionDto {
  @ApiProperty({ description: 'Name of the mission', example: 'Nightly Patrol' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The device ID this mission is for', example: 'camera-001' })
  @IsString()
  deviceId: string;

  @ApiProperty({ description: 'List of phases for the mission', type: [CreatePhaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhaseDto)
  phases: CreatePhaseDto[];
}

export class UpdateScanMissionDto {
  @ApiProperty({ description: 'Name of the mission', required: false, example: 'Nightly Patrol' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'The device ID this mission is for', required: false, example: 'camera-001' })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ description: 'List of phases for the mission', required: false, type: [CreatePhaseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhaseDto)
  phases?: CreatePhaseDto[];

  @ApiProperty({ description: 'Whether the mission is active', required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ScanMissionDto extends CreateScanMissionDto {
  @ApiProperty({ description: 'Unique identifier for the mission', example: 'mock-mission-1' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Whether the mission is active', example: false })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'List of phases for the mission', type: [PhaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhaseDto)
  declare phases: PhaseDto[];
}
