import { Module } from '@nestjs/common';
import { RasRadarService } from './ras-radar.service';
import { RasRadarController } from './ras-radar.controller';
import { RasRadarClientModule } from '@/rasClients/ras-radar-client/ras-radar-client.module';

@Module({
  imports: [RasRadarClientModule],
  controllers: [RasRadarController],
  providers: [RasRadarService],
})
export class RasRadarModule {}
