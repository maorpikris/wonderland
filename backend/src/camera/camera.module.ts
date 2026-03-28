import { Module } from '@nestjs/common';
import { CameraService } from './camera.service';
import { CameraController } from './camera.controller';
import { MediaMTXService } from './mediamtx.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CameraEntity } from './entities/camera.entity';
import { CameraGateway } from './camera.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { StandalonePlaybackController } from '../playback/playback.controller';
import { PlaybackService } from '../playback/playback.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([CameraEntity]),
    ScheduleModule.forRoot(),
  ],
  controllers: [CameraController, StandalonePlaybackController],
  providers: [CameraService, MediaMTXService, CameraGateway, PlaybackService],
  exports: [CameraService],
})
export class CameraModule {}
