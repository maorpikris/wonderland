import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RasRadarClientService } from './ras-radar-client.service';
import { createRasClientConfig } from '@/config/rasClient.config';

@Module({
  imports: [HttpModule.registerAsync(createRasClientConfig('/radar'))],
  providers: [RasRadarClientService],
  exports: [RasRadarClientService],
})
export class RasRadarClientModule {}
