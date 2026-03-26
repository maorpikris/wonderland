import { Module } from '@nestjs/common';
import { RasCameraService } from './ras-camera.service';
import { RasCameraController } from './ras-camera.controller';
import { RasCameraClientModule } from '@/rasClients/ras-camera-client/ras-camera-client.module';

import { ScanMissionModule } from '../scan-mission/scan-mission.module';

@Module({
  imports: [RasCameraClientModule, ScanMissionModule],
  controllers: [RasCameraController],
  providers: [RasCameraService],
})
export class RasCameraModule {}
