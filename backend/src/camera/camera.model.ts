import { Logger } from '@nestjs/common';
import axios from 'axios';
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
  videoPort?: number;
  getHighResSource(): string;
  getLowResSource(): string;
  getThermalHighResSource(): string;
  getThermalLowResSource(): string;
  hasThermal(): boolean;
  dayNightModeStrategy: 'stream' | 'api' | 'none';
  setDayNightMode(mode: 'day' | 'night'): Promise<void>;
  initOnvif(): Promise<void>;
  handleMoveRequest(
    pan: number,
    tilt: number,
    zoom: number,
    isThermal?: boolean,
    sensitivity?: number,
  ): void;
  handleFocusRequest(speed: number, isThermal?: boolean): void;
  getPTZStatus(): Promise<{ pan: number; zoom: number } | null>;
  calculateFOV(zoom: number): number;
  stop(): void;
  stopFocus(isThermal?: boolean): void;
}

export abstract class BaseCamera implements Camera {
  protected readonly logger = new Logger(this.constructor.name);
  protected onvifCam: any = null;
  protected moveTimeout: NodeJS.Timeout | null = null;
  protected focusTimeout: NodeJS.Timeout | null = null;
  protected isInitializing: boolean = false;
  public dayNightModeStrategy: 'stream' | 'api' | 'none' = 'none';

  constructor(
    public id: number,
    public type: CameraType,
    public ip: string,
    public username: string,
    public password?: string,
    public onvifPort: number = 80,
    public videoPort: number = 554,
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

  async setDayNightMode(mode: 'day' | 'night'): Promise<void> {
    // Default implementation does nothing
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

  handleMoveRequest(
    pan: number,
    tilt: number,
    zoom: number,
    isThermal: boolean = false,
    sensitivity: number = 1.0,
  ): void {
    this.move(pan, tilt, zoom, isThermal, sensitivity);
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
    }
    this.moveTimeout = setTimeout(() => {
      this.stop();
    }, 500);
  }

  handleFocusRequest(speed: number, isThermal: boolean = false): void {
    this.focus(speed, isThermal);
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }
    this.focusTimeout = setTimeout(() => {
      this.stopFocus(isThermal);
    }, 200);
  }

  protected move(
    pan: number,
    tilt: number,
    zoom: number,
    isThermal: boolean = false,
    sensitivity: number = 1.0,
  ): void {
    if (!this.onvifCam) {
      this.logger.warn(
        `Cannot handle move request: ONVIF not initialized for camera ${this.id}`,
      );
      return;
    }

    try {
      const profileToken = this.getProfileToken(isThermal);
      if (!profileToken) {
        this.logger.warn(`No active ONVIF profile found for camera ${this.id}`);
        return;
      }
      const body = {
        profileToken,
        x: pan * sensitivity,
        y: tilt * sensitivity,
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

  protected focus(speed: number, isThermal: boolean = false): void {
    if (!this.onvifCam) {
      this.logger.warn(
        `Cannot handle focus request: ONVIF not initialized for camera ${this.id}`,
      );
      return;
    }

    try {
      const videoSourceToken = this.getVideoSourceToken(isThermal);
      if (!videoSourceToken) {
        this.logger.warn(
          `No VideoSourceToken found for camera ${this.id} (isThermal: ${isThermal})`,
        );
        return;
      }

      this.onvifCam.imagingMove({
        token: videoSourceToken,
        continuous: { speed },
      });
      this.logger.log(
        `ONVIF focus request for camera ${this.id} (isThermal: ${isThermal}): speed=${speed}`,
      );
    } catch (e: any) {
      this.logger.error(
        `ONVIF focus move error on camera ${this.id}: ${e.message}`,
      );
    }
  }

  protected getProfileToken(isThermal: boolean = false) {
    if (this.onvifCam.activeSource?.profileToken) {
      return this.onvifCam.activeSource.profileToken;
    }
    return this.onvifCam.profiles[0]?.['$']?.token;
  }

  protected getVideoSourceToken(isThermal: boolean = false): string | null {
    if (this.onvifCam.activeSource?.sourceToken) {
      return this.onvifCam.activeSource.sourceToken;
    }
    return this.onvifCam.videoSources[0]?.['$']?.token || null;
  }

  async getPTZStatus(): Promise<{
    pan: number;
    tilt: number;
    zoom: number;
  } | null> {
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
          tilt: position.y ?? 0,
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
      const profileToken = this.getProfileToken();
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

  stopFocus(isThermal: boolean = false): void {
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = null;
    }
    if (!this.onvifCam) return;

    try {
      const videoSourceToken = this.getVideoSourceToken(isThermal);
      if (!videoSourceToken) return;

      this.onvifCam.imagingStop({
        token: videoSourceToken,
      });
    } catch (e: any) {
      this.logger.error(
        `ONVIF imaging stop error on camera ${this.id}: ${e.message}`,
      );
    }
  }
}

export class SimplePtzCamera extends BaseCamera {
  public dayNightModeStrategy: 'stream' | 'api' | 'none' = 'api';

  async setDayNightMode(mode: 'day' | 'night'): Promise<void> {
    this.logger.log(`SimplePtzCamera ${this.id}: Changing to ${mode} mode`);
    try {
      const uidResponse = await axios.get(
        `http://${this.ip}/cgi-bin/getuid?username=${this.username}&password=${this.password}`,
      );
      const uidMatch = uidResponse.data.toString().match(/<uid>(.*?)<\/uid>/);
      const uid = uidMatch ? uidMatch[1] : null;

      if (!uid) {
        this.logger.error(
          `SimplePtzCamera ${this.id}: Could not fetch UID from camera. Response: ${uidResponse.data}`,
        );
        return;
      }

      this.logger.log(
        `SimplePtzCamera ${this.id}: Fetched UID: ${uid}. Sending ircut command...`,
      );

      // The camera's IRCUT behavior is inverted: sending 'day' sets it to night mode and vice versa.
      const invertedMode = mode === 'day' ? 'night' : 'day';
      await axios.get(
        `http://${this.ip}/cgi-bin/set_ircut?ircutmode=3&uid=${uid}&time=${invertedMode}`,
      );
      this.logger.log(
        `SimplePtzCamera ${this.id}: Successfully set mode to ${mode} (sent ${invertedMode} to camera)`,
      );
    } catch (error: any) {
      this.logger.error(
        `SimplePtzCamera ${this.id}: Failed to set day/night mode: ${error.message}`,
      );
    }
  }

  getHighResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:${this.videoPort ?? 554}/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif`;
  }

  getLowResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:${this.videoPort ?? 554}/cam/realmonitor?channel=1&subtype=1&unicast=true&proto=Onvif`;
  }

  protected getVideoSourceToken(isThermal: boolean = false): string | null {
    return 'VideoSourceMain';
  }

  async getPTZStatus(): Promise<{
    pan: number;
    tilt: number;
    zoom: number;
  } | null> {
    const status = await super.getPTZStatus();
    if (!status) return null;

    // We invert the pan value for SimplePtzCamera because it reports an absolute
    // pan status that is opposite to the standard geographic rotation.
    // Inverting it ensures that panning Right (positive speed) results in
    // an increasing azimuth (Clockwise) on the map.
    return {
      ...status,
      pan: -status.pan,
      tilt: -status.tilt,
    };
  }

  calculateFOV(zoom: number): number {
    return calculateFOV(zoom, 4.8, 4.7, 94.0, 30);
  }
}

export class ThermalPtzCamera extends BaseCamera {
  public dayNightModeStrategy: 'stream' | 'api' | 'none' = 'stream';

  getHighResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:${this.videoPort ?? 554}/Stream/Live/101?transportmode=unicast&profile=ONFProfileToken_101`;
  }

  getLowResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:${this.videoPort ?? 554}/Stream/Live/102?transportmode=unicast&profile=ONFProfileToken_102`;
  }

  calculateFOV(zoom: number): number {
    // Thermal camera often have different lenses and FOV parameters
    return calculateFOV(zoom, 4.8, 4.7, 94.0, 30, 1, 0);
  }

  hasThermal(): boolean {
    return true;
  }

  getThermalHighResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:${this.videoPort ?? 554}/Stream/Live/201?transportmode=unicast&profile=ONFProfileToken_201`;
  }

  getThermalLowResSource(): string {
    return `rtsp://${this.username}:${this.password}@${this.ip}:${this.videoPort ?? 554}/Stream/Live/202?transportmode=unicast&profile=ONFProfileToken_202`;
  }

  protected getProfileToken(isThermal: boolean = false) {
    const profileToken = isThermal
      ? 'ONFProfileToken_201'
      : 'ONFProfileToken_101';
    return profileToken;
  }

  protected getVideoSourceToken(isThermal: boolean = false): string | null {
    // Thermal cameras usually have VideoSource_1 for Day and VideoSource_2 for Thermal
    const token = isThermal ? 'VideoSource_2' : 'VideoSource_1';
    return token;
  }

  move(
    pan: number,
    tilt: number,
    zoom: number,
    isThermal: boolean = false,
    sensitivity: number = 1.0,
  ): void {
    if (!this.onvifCam) {
      this.logger.warn(
        `Cannot handle move request: ONVIF not initialized for camera ${this.id}`,
      );
      return;
    }

    try {
      const profileToken = isThermal
        ? 'ONFProfileToken_201'
        : 'ONFProfileToken_101';

      const body: any = {
        profileToken,
        x: pan * sensitivity,
        y: tilt * sensitivity,
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
          json.videoPort,
        );
      case CameraType.THERMAL_PTZ:
        return new ThermalPtzCamera(
          json.id,
          json.type,
          json.ip,
          json.username,
          json.password,
          json.onvifPort,
          json.videoPort,
        );
      default:
        throw new Error(`Unknown camera type: ${json.type}`);
    }
  },
};
