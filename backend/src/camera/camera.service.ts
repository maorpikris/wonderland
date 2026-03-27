import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DeviceAvailabilityStatusEnum } from '@/enum/enums';
import { MediaMTXService } from './mediamtx.service';
import { Camera, CameraFactory } from './camera.model';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CameraService implements OnModuleInit {
  private readonly logger = new Logger(CameraService.name);
  private cameras: Camera[] = [];

  constructor(private readonly mediamtxService: MediaMTXService) {}

  async onModuleInit() {
    await this.loadCameras();
    await this.registerCamerasWithMediaMTX();
  }

  private async loadCameras() {
    try {
      const configPath = path.resolve(process.cwd(), 'cameras.json');
      const data = await fs.readFile(configPath, 'utf8');
      const jsonCameras = JSON.parse(data);
      this.cameras = jsonCameras.map((json: any) => CameraFactory.fromJSON(json));
      this.logger.log(`Loaded ${this.cameras.length} cameras from config`);

      // Initialize ONVIF for all cameras
      await Promise.all(this.cameras.map((c) => c.initOnvif()));
    } catch (error) {
      this.logger.error(`Failed to load cameras.json: ${error.message}`);
    }
  }

  private async registerCamerasWithMediaMTX() {
    for (const camera of this.cameras) {
      try {
        const highResPath = `${camera.id}_high`;
        const lowResPath = `${camera.id}_low`;

        await this.mediamtxService.addPath({
          name: highResPath,
          source: camera.getHighResSource(),
          sourceOnDemand: true
        });

        await this.mediamtxService.addPath({
          name: lowResPath,
          source: camera.getLowResSource(),
          sourceOnDemand: false
        });

        this.logger.log(`Registered MediaMTX paths for camera ${camera.id} from type ${camera.type}`);
      } catch (error) {
        this.logger.error(`Failed to register camera ${camera.id} with MediaMTX: ${error.message}`);
      }
    }
  }

  async getAllCameraIds() {
    return this.cameras.map((c) => c.id.toString());
  }

  async moveCamera(id: string, pan: number, tilt: number, zoom: number) {
    const camera = this.cameras.find((c) => c.id.toString() === id);
    if (!camera) {
      throw new Error(`Camera with ID ${id} not found`);
    }
    camera.handleMoveRequest(pan, tilt, zoom);
  }

  async stopCamera(id: string) {
    const camera = this.cameras.find((c) => c.id.toString() === id);
    if (!camera) {
      throw new Error(`Camera with ID ${id} not found`);
    }
    camera.stop();
  }

  async getAllCamerasWithData() {
    return this.cameras.map((camera) => ({
      ...camera,
      id: camera.id.toString(),
      name: `camera_${camera.id}`,
      type: camera.type,
      availability: DeviceAvailabilityStatusEnum.AVAILABLE,
    }));
  }
}
