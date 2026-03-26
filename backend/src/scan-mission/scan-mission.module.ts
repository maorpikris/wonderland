import { Module } from '@nestjs/common';
import { ScanMissionController } from './scan-mission.controller';
import { ScanMissionService } from './scan-mission.service';

@Module({
  controllers: [ScanMissionController],
  providers: [ScanMissionService],
  exports: [ScanMissionService],
})
export class ScanMissionModule {}
