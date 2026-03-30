import { Logger } from '@nestjs/common';
import { CameraType } from '@/enum/enums';
import { calculateFOV } from './utils';

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
  getThermalHighResSource(): string;
  getThermalLowResSource(): string;
  hasThermal(): boolean;
  initOnvif(): Promise<void>;
  handleMoveRequest(pan: number, tilt: number, zoom: number, isThermal?: boolean): void;
  getPTZStatus(): Promise<{ pan: number; zoom: number } | null>;
  calculateFOV(zoom: number): number;
  stop(): void;
}

export abstract class BaseCamera implements Camera {
  protected readonly logger = new Logger(this.constructor.name);
  protected onvifCam: any = null;
  protected moveTimeout: NodeJS.Timeout | null = null;
  protected isInitializing: boolean = false;

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

  getThermalHighResSource(): string {
    return '';
  }

  getThermalLowResSource(): string {
    return '';
  }

  hasThermal(): boolean {
    return false;
  }

  async initOnvif(): Promise<void> {
    if (this.isInitializing || this.onvifCam) return;
    this.isInitializing = true;

    return new Promise((resolve) => {
      try {
        const cam = new onvif.Cam(
          {
            hostname: this.ip,
            username: this.username,
            password: this.password,
            port: this.onvifPort,
            timeout: 5000,
          },
          (err: any) => {
            this.isInitializing = false;
            if (err) {
              this.logger.error(
                `Failed to initialize ONVIF for camera ${this.id}: ${err.message}. Retrying in 10s...`,
              );
              this.onvifCam = null;
              setTimeout(() => this.initOnvif(), 10000);
              return resolve();
            }
            this.onvifCam = cam;
            this.logger.log(`ONVIF initialized for camera ${this.id}`);
            resolve();
          },
        );
      } catch (error: any) {
        this.isInitializing = false;
        this.logger.error(
          `Critical error during ONVIF initialization for camera ${this.id}: ${error.message}. Retrying in 10s...`,
        );
        this.onvifCam = null;
        setTimeout(() => this.initOnvif(), 10000);
        resolve();
      }
    });
  }

  handleMoveRequest(pan: number, tilt: number, zoom: number, isThermal: boolean = false): void {
    this.move(pan, tilt, zoom, isThermal);
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
    }
    this.moveTimeout = setTimeout(() => {
      this.stop();
    }, 500);
  }

  protected move(pan: number, tilt: number, zoom: number, isThermal: boolean = false): void {
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

  protected getProfileToken() {
    const profileToken =
      this.onvifCam.activeSource?.profileToken ||
      this.onvifCam.profiles[0]?.['$']?.token;

    return profileToken;
  }

  async getPTZStatus(): Promise<{ pan: number; zoom: number } | null> {
    if (!this.onvifCam) return null;
    const profileToken = this.getProfileToken();

    if (!profileToken) {
      this.logger.warn(`No active ONVIF profile found for camera ${this.id}`);
      return null;
    }

    return new Promise((resolve) => {
      this.onvifCam.getStatus({ profileToken }, (err: any, status: any) => {
        if (err) {
          this.logger.error(
            `Failed to get status for camera ${this.id}: ${err.message}. Triggering reconnection...`,
          );

          return resolve(null);
        }

        const position = status.position;
        if (!position) return resolve(null);

        resolve({
          pan: position.x ?? 0,
          zoom: position.zoom ?? 0,
        });
      });
    });
  }

  abstract calculateFOV(zoom: number): number;

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

  calculateFOV(zoom: number): number {
    return calculateFOV(zoom, 4.8, 4.7, 94.0, 30);
  }
}

export class ThermalPtzCamera extends BaseCamera {
  getHighResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:554/Stream/Live/101?transportmode=unicast&profile=ONFProfileToken_101`;
  }

  getLowResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:554/Stream/Live/102?transportmode=unicast&profile=ONFProfileToken_102`;
  }

  calculateFOV(zoom: number): number {
    // Thermal camera often have different lenses and FOV parameters
    return calculateFOV(zoom, 4.8, 4.7, 94.0, 30, 1, 0);
  }

  hasThermal(): boolean {
    return true;
  }

  getThermalHighResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:554/Stream/Live/201?transportmode=unicast&profile=ONFProfileToken_201`;
  }

  getThermalLowResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:554/Stream/Live/202?transportmode=unicast&profile=ONFProfileToken_202`;
  }

  protected getProfileToken() {
    const profileToken = 'ONFProfileToken_101';

    return profileToken;
  }

  move(pan: number, tilt: number, zoom: number, isThermal: boolean = false): void {
    if (!this.onvifCam) {
      this.logger.warn(
        `Cannot handle move request: ONVIF not initialized for camera ${this.id}`,
      );
      return;
    }

    try {
      const profileToken = isThermal ? 'ONFProfileToken_201' : 'ONFProfileToken_101';
      
      const body: any = {
        profileToken,
        x: pan / 3,
        y: tilt / 3,
        zoom: zoom,
      };

      if (zoom == 0) {
        body.onlySendPanTilt = true;
      } else {
        body.onlySendZoom = true;
      }

      this.onvifCam.continuousMove(body);
      this.logger.log(
        `ONVIF continuous move request for camera ${this.id} (lens: ${isThermal ? 'thermal' : 'day'}): ${JSON.stringify(body)}`,
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
