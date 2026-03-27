import { Module } from '@nestjs/common';
import { CameraService } from './camera.service';
import { CameraController } from './camera.controller';
import { MediaMTXService } from './mediamtx.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CameraEntity } from './entities/camera.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([CameraEntity])],
  controllers: [CameraController],
  providers: [CameraService, MediaMTXService],
})
export class CameraModule {}
