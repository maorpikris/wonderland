import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RasCameraClientService } from './ras-camera-client.service';
import { createRasClientConfig } from '@/config/rasClient.config';

@Module({
  imports: [HttpModule.registerAsync(createRasClientConfig('/cameras'))],
  providers: [RasCameraClientService],
  exports: [RasCameraClientService],
})
export class RasCameraClientModule {}
