import { Logger } from '@nestjs/common';
import { CameraType } from '@/enum/enums';
// @ts-ignore
import * as onvif from 'onvif';

export interface Camera {
  id: number;
  type: CameraType;
  ip: string;
  username: string;
  password?: string;
  onvifPort?: number;
  getHighResSource(): string;
  getLowResSource(): string;
  initOnvif(): Promise<void>;
  handleMoveRequest(pan: number, tilt: number, zoom: number): void;
  stop(): void;
}

export abstract class BaseCamera implements Camera {
  protected readonly logger = new Logger(this.constructor.name);
  protected onvifCam: any = null;
  protected moveTimeout: NodeJS.Timeout | null = null;

  constructor(
    public id: number,
    public type: CameraType,
    public ip: string,
    public username: string,
    public password?: string,
    public onvifPort: number = 80,
  ) {}

  abstract getHighResSource(): string;
  abstract getLowResSource(): string;

  async initOnvif(): Promise<void> {
    return new Promise((resolve) => {
      this.onvifCam = new onvif.Cam(
        {
          hostname: this.ip,
          username: this.username,
          password: this.password,
          port: this.onvifPort,
          timeout: 5000,
        },
        (err: any) => {
          if (err) {
            this.logger.error(
              `Failed to initialize ONVIF for camera ${this.id}: ${err.message}`,
            );

            return resolve();
          }
          this.logger.log(`ONVIF initialized for camera ${this.id}`);
          resolve();
        },
      );
    });
  }

  handleMoveRequest(pan: number, tilt: number, zoom: number): void {
    this.move(pan, tilt, zoom);
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
    }
    this.moveTimeout = setTimeout(() => {
      this.stop();
    }, 500);
  }

  protected move(pan: number, tilt: number, zoom: number): void {
    if (!this.onvifCam) {
      this.logger.warn(
        `Cannot handle move request: ONVIF not initialized for camera ${this.id}`,
      );
      return;
    }

    try {
      const profileToken =
        this.onvifCam.activeSource?.profileToken ||
        this.onvifCam.profiles[0]?.['$']?.token;
      if (!profileToken) {
        this.logger.warn(`No active ONVIF profile found for camera ${this.id}`);
        return;
      }
      const body = {
        profileToken,
        x: pan,
        y: tilt,
        zoom: zoom,
      };

      this.onvifCam.continuousMove(body);
      this.logger.log(
        `ONVIF continuous move request for camera ${this.id}: ${JSON.stringify(body)}`,
      );
    } catch (e: any) {
      this.logger.error(
        `ONVIF continuous move error on camera ${this.id}: ${e.message}`,
      );
    }
  }

  stop(): void {
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
      this.moveTimeout = null;
    }
    if (!this.onvifCam) return;

    try {
      const profileToken =
        this.onvifCam.activeSource?.profileToken ||
        this.onvifCam.profiles[0]?.['$']?.token;
      if (!profileToken) return;

      this.onvifCam.stop({
        profileToken,
        panTilt: true,
        zoom: true,
      });
    } catch (e: any) {
      this.logger.error(`ONVIF stop error on camera ${this.id}: ${e.message}`);
    }
  }
}

export class SimplePtzCamera extends BaseCamera {
  getHighResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:554/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif`;
  }

  getLowResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:554/cam/realmonitor?channel=1&subtype=1&unicast=true&proto=Onvif`;
  }
}

export class ThermalPtzCamera extends BaseCamera {
  getHighResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:554/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif`;
  }

  getLowResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:554/cam/realmonitor?channel=1&subtype=1&unicast=true&proto=Onvif`;
  }

  move(pan: number, tilt: number, zoom: number): void {
    if (!this.onvifCam) {
      this.logger.warn(
        `Cannot handle move request: ONVIF not initialized for camera ${this.id}`,
      );
      return;
    }

    try {
      const profileToken =
        this.onvifCam.activeSource?.profileToken ||
        this.onvifCam.profiles[0]?.['$']?.token;
      if (!profileToken) {
        this.logger.warn(`No active ONVIF profile found for camera ${this.id}`);
        return;
      }

      const body: any = {
        profileToken,
        x: pan,
        y: tilt,
        zoom: zoom,
      };

      if (zoom == 0) {
        body.onlySendPanTilt = true;
      } else {
        body.onlySendZoom = true;
      }

      this.onvifCam.continuousMove(body);
      this.logger.log(
        `ONVIF continuous move request for camera ${this.id}: ${JSON.stringify(body)}`,
      );
    } catch (e: any) {
      this.logger.error(
        `ONVIF continuous move error on camera ${this.id}: ${e.message}`,
      );
    }
  }
}

export const CameraFactory = {
  fromJSON(json: any): Camera {
    switch (json.type) {
      case CameraType.SIMPLE_PTZ:
        return new SimplePtzCamera(
          json.id,
          json.type,
          json.ip,
          json.username,
          json.password,
          json.onvifPort,
        );
      case CameraType.THERMAL_PTZ:
        return new ThermalPtzCamera(
          json.id,
          json.type,
          json.ip,
          json.username,
          json.password,
          json.onvifPort,
        );
      default:
        throw new Error(`Unknown camera type: ${json.type}`);
    }
  },
};
