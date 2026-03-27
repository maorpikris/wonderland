import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceAvailabilityStatusEnum } from '@/enum/enums';
import { MediaMTXService } from './mediamtx.service';
import { Camera, CameraFactory } from './camera.model';
import { CameraEntity } from './entities/camera.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CameraService implements OnModuleInit {
  private readonly logger = new Logger(CameraService.name);
  private cameras: Camera[] = [];
  private cameraEntities: Map<number, CameraEntity> = new Map();

  constructor(
    private readonly mediamtxService: MediaMTXService,
    @InjectRepository(CameraEntity)
    private readonly cameraRepository: Repository<CameraEntity>,
  ) {}

  async onModuleInit() {
    await this.loadCameras();
    await this.registerCamerasWithMediaMTX();
  }

  private async loadCameras() {
    try {
      const configPath = path.resolve(process.cwd(), 'cameras.json');
      const data = await fs.readFile(configPath, 'utf8');
      const jsonCameras = JSON.parse(data);
      this.cameras = jsonCameras.map((json: any) =>
        CameraFactory.fromJSON(json),
      );
      this.logger.log(`Loaded ${this.cameras.length} cameras from config`);

      for (const camera of this.cameras) {
        let entity = await this.cameraRepository.findOne({
          where: { id: camera.id },
        });
        if (!entity) {
          this.logger.log(
            `Camera ${camera.id} not found in DB, creating with default data...`,
          );
          const json = jsonCameras.find((j: any) => j.id === camera.id);
          entity = this.cameraRepository.create({
            id: camera.id,
            name: `camera_${camera.id}`,
            ip: json.ip,
            type: json.type,
            username: json.username,
            password: json.password,
            onvifPort: json.onvifPort || 80,
          });
          await this.cameraRepository.save(entity);
        }
        this.cameraEntities.set(camera.id, entity);
      }

      // Initialize ONVIF for all cameras
      await Promise.all(this.cameras.map((c) => c.initOnvif()));
    } catch (error) {
      this.logger.error(`Failed to load cameras: ${error.message}`);
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
          sourceOnDemand: true,
        });

        await this.mediamtxService.addPath({
          name: lowResPath,
          source: camera.getLowResSource(),
          sourceOnDemand: false,
        });

        this.logger.log(
          `Registered MediaMTX paths for camera ${camera.id} from type ${camera.type}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to register camera ${camera.id} with MediaMTX: ${error.message}`,
        );
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

  async updateCamera(id: string, updateData: Partial<CameraEntity>) {
    const numericId = parseInt(id);
    const entity = await this.cameraRepository.findOne({
      where: { id: numericId },
    });
    if (!entity) {
      throw new Error(`Camera with ID ${id} not found in DB`);
    }

    Object.assign(entity, updateData);
    await this.cameraRepository.save(entity);

    this.cameraEntities.set(numericId, entity);

    return entity;
  }

  async getAllCamerasWithData() {
    return this.cameras.map((camera) => {
      const entity = this.cameraEntities.get(camera.id);
      return {
        ...camera,
        id: camera.id.toString(),
        name: entity?.name || `camera_${camera.id}`,
        type: camera.type,
        availability: DeviceAvailabilityStatusEnum.AVAILABLE,
        initialAzimuth: entity?.initialAzimuth,
        position: entity?.position,
      };
    });
  }
}
