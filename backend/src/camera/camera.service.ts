/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceAvailabilityStatusEnum } from '@/enum/enums';
import { MediaMTXService } from './mediamtx.service';
import { Camera, CameraFactory } from './camera.model';
import { CameraEntity } from './entities/camera.entity';
import { CameraGateway } from './camera.gateway';
import { Interval } from '@nestjs/schedule';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CameraService implements OnModuleInit {
  private readonly logger = new Logger(CameraService.name);
  private cameras: Camera[] = [];
  private cameraEntities: Map<number, CameraEntity> = new Map();
  private cameraAvailability: Map<string, DeviceAvailabilityStatusEnum> =
    new Map();

  constructor(
    private readonly mediamtxService: MediaMTXService,
    private readonly cameraGateway: CameraGateway,
    @InjectRepository(CameraEntity)
    private readonly cameraRepository: Repository<CameraEntity>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.loadCameras();
    await this.registerCamerasWithMediaMTX();
    this.checkMediaMTXAvailability().catch((e) =>
      this.logger.error(`Initial availability check failed: ${e.message}`),
    );
  }

  private async loadCameras() {
    try {
      const configPath = path.resolve(process.cwd(), 'cameras.json');
      const data = await fs.readFile(configPath, 'utf8');
      const jsonCameras = JSON.parse(data);
      console.log('Loaded camera config:', jsonCameras);
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
            videoPort: json.videoPort || 554,
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
        const highResPath = `${camera.id}/high`;
        const lowResPath = `${camera.id}/low`;

        this.logger.log(camera.getThermalHighResSource());

        const recordingsPath =
          this.configService.get<string>('RECORDINGS_PATH') || '/recordings';

        await this.mediamtxService.addPath({
          name: highResPath,
          source: camera.getHighResSource(),
          sourceOnDemand: true,
          record: true,
          recordPath: `${recordingsPath}/%path/%Y-%m-%d_%H-%M-%S-%f`,
        });

        await this.mediamtxService.addPath({
          name: lowResPath,
          source: camera.getLowResSource(),
          sourceOnDemand: false,
          record: true,
          recordPath: `${recordingsPath}/%path/%Y-%m-%d_%H-%M-%S-%f`,
        });

        if (camera.hasThermal()) {
          const thermalHighResPath = `thermal_${camera.id}/high`;
          const thermalLowResPath = `thermal_${camera.id}/low`;

          await this.mediamtxService.addPath({
            name: thermalHighResPath,
            source: camera.getThermalHighResSource(),
            sourceOnDemand: true,
            record: true,
            recordPath: `${recordingsPath}/%path/%Y-%m-%d_%H-%M-%S-%f`,
          });

          await this.mediamtxService.addPath({
            name: thermalLowResPath,
            source: camera.getThermalLowResSource(),
            sourceOnDemand: false,
            record: true,
            recordPath: `${recordingsPath}/%path/%Y-%m-%d_%H-%M-%S-%f`,
          });
        }

        this.logger.log(
          `Registered MediaMTX paths for camera ${camera.id} (thermal: ${camera.hasThermal()})`,
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

  async moveCamera(
    id: string,
    pan: number,
    tilt: number,
    zoom: number,
    isThermal: boolean = false,
    sensitivity: number = 1.0,
  ) {
    const camera = this.cameras.find((c) => c.id.toString() === id);
    if (!camera) {
      throw new Error(`Camera with ID ${id} not found`);
    }
    camera.handleMoveRequest(pan, tilt, zoom, isThermal, sensitivity);
  }

  async stopCamera(id: string) {
    const camera = this.cameras.find((c) => c.id.toString() === id);
    if (!camera) {
      throw new Error(`Camera with ID ${id} not found`);
    }
    camera.stop();
  }

  async setCameraMode(id: string, mode: 'day' | 'night') {
    const camera = this.cameras.find((c) => c.id.toString() === id);
    if (!camera) {
      throw new Error(`Camera with ID ${id} not found`);
    }
    await camera.setDayNightMode(mode);
  }

  async focusCamera(id: string, speed: number, isThermal: boolean = false) {
    const camera = this.cameras.find((c) => c.id.toString() === id);
    if (!camera) {
      throw new Error(`Camera with ID ${id} not found`);
    }
    camera.handleFocusRequest(speed, isThermal);
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

  @Interval(2000)
  async pollCameraStatus() {
    for (const camera of this.cameras) {
      try {
        const status = await camera.getPTZStatus();
        if (!status) continue;

        const entity = this.cameraEntities.get(camera.id);
        const initialAzimuth = entity?.initialAzimuth || 0;

        // ONVIF Pan is typically -1 to 1.
        // We need to map it to degrees. assuming 180 degrees range or similar.
        // For simplicity, let's assume status.pan is offset in degrees if the camera supports it,
        // or map -1..1 to -180..180.
        const panOffset = status.pan * 180;
        const currentAzimuth = (initialAzimuth + panOffset + 360) % 360;
        const currentFOV = camera.calculateFOV(status.zoom);

        this.cameraGateway.broadcastCameraUpdate({
          id: camera.id.toString(),
          azimuth: currentAzimuth,
          fov: currentFOV,
        });
      } catch (error) {
        this.logger.error(
          `Error polling status for camera ${camera.id}: ${error.message}`,
        );
      }
    }
  }

  @Interval(5000)
  async checkMediaMTXAvailability() {
    try {
      const pathsData = await this.mediamtxService.listPaths();
      const pathItems = pathsData?.items || [];

      for (const camera of this.cameras) {
        const id = camera.id.toString();
        const lowResPathName = `${id}_low`;
        const pathInfo = pathItems.find((p: any) => p.name === lowResPathName);

        const currentStatus =
          pathInfo?.ready === true
            ? DeviceAvailabilityStatusEnum.AVAILABLE
            : DeviceAvailabilityStatusEnum.UNAVAILABLE;

        const previousStatus = this.cameraAvailability.get(id);

        if (currentStatus !== previousStatus) {
          this.cameraAvailability.set(id, currentStatus);
          this.cameraGateway.broadcastCameraStatusUpdate({
            id,
            availability: currentStatus,
          });
          this.logger.log(
            `Camera ${id} availability changed to ${currentStatus}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to check MediaMTX availability: ${error.message}`,
      );
    }
  }

  async getAllCamerasWithData() {
    return this.cameras.map((camera) => {
      const entity = this.cameraEntities.get(camera.id);
      const id = camera.id.toString();
      return {
        ...camera,
        id,
        name: entity?.name || `camera_${camera.id}`,
        type: camera.type,
        availability:
          this.cameraAvailability.get(id) ||
          DeviceAvailabilityStatusEnum.UNAVAILABLE,
        initialAzimuth: entity?.initialAzimuth,
        position: entity?.position,
        hasThermal: camera.hasThermal(),
        dayNightModeStrategy: camera.dayNightModeStrategy,
      };
    });
  }

  async getRecordings(id: string, start?: string, end?: string) {
    const camera = this.cameras.find((c) => c.id.toString() === id);
    const hasThermal = camera?.hasThermal() || false;

    const paths = {
      high: `${id}_high`,
      low: `${id}_low`,
      thermal_high: hasThermal ? `thermal_${id}_high` : null,
      thermal_low: hasThermal ? `thermal_${id}_low` : null,
    };

    const results: any = {};

    for (const [key, pathName] of Object.entries(paths)) {
      if (!pathName) continue;
      try {
        results[key] = await this.mediamtxService.listRecordings(
          pathName,
          start,
          end,
        );
      } catch (error) {
        this.logger.warn(`Could not fetch ${key} recordings for ${id}`);
        results[key] = [];
      }
    }

    return results;
  }
}
