import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface MediaMTXPathSource {
  type: string;
  url?: string;
}

export interface MediaMTXPathConfig {
  name: string;
  source: string;
  sourceOnDemand?: boolean;
  record?: boolean;
  recordPath?: string;
  recordFormat?: 'fmp4' | 'ts';
  recordPartDuration?: string;
  recordPartMaxSize?: string;
  recordSegmentDuration?: string;
  recordDeleteAfter?: string;
}

@Injectable()
export class MediaMTXService {
  private readonly logger = new Logger(MediaMTXService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('MEDIAMTX_API_URL') ??
      'http://localhost:9997';
    this.logger.log(`MediaMTX API base URL: ${this.baseUrl}`);
  }

  async addPath(config: MediaMTXPathConfig): Promise<void> {
    const url = `${this.baseUrl}/v3/config/paths/add/${config.name}`;
    const payload = {
      source: config.source,
      sourceOnDemand: config.sourceOnDemand ?? true,
      record: config.record ?? false,
      recordPath: config.recordPath,
      recordFormat: config.recordFormat ?? 'fmp4',
      recordPartDuration: config.recordPartDuration ?? '10s',
      recordSegmentDuration: config.recordSegmentDuration ?? '10m',
      // Older MediaMTX builds reject "d" suffix; "240h" is equivalent to 10 days.
      recordDeleteAfter: config.recordDeleteAfter ?? '240h',
      playback: true,
    };

    try {
      await firstValueFrom(this.httpService.post(url, payload));
      this.logger.log(`Successfully registered path: ${config.name}`);
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.error?.includes('already exists')
      ) {
        this.logger.warn(
          `Path ${config.name} already exists in MediaMTX. Checking for source mismatch...`,
        );

        try {
          const currentConfig = await this.getPathConfig(config.name);
          if (currentConfig && currentConfig.source !== config.source) {
            this.logger.log(
              `Source mismatch for ${config.name}: current='${currentConfig.source}', new='${config.source}'. Updating...`,
            );
            await this.patchPath(config.name, { source: config.source });
            this.logger.log(`Successfully updated path source: ${config.name}`);
          } else {
            this.logger.log(`Source matches for ${config.name}. No update needed.`);
          }
        } catch (getConfigError) {
          this.logger.error(
            `Failed to verify/update existing path ${config.name}: ${getConfigError.message}`,
          );
        }
        return;
      }

      this.logger.error(
        `Failed to register path ${config.name}: ${error.response?.data?.error ?? error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getPathConfig(name: string): Promise<any> {
    const url = `${this.baseUrl}/v3/config/paths/get/${name}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get path config for ${name}: ${error.message}`,
      );
      throw error;
    }
  }

  async patchPath(name: string, config: any): Promise<void> {
    const url = `${this.baseUrl}/v3/config/paths/patch/${name}`;
    try {
      await firstValueFrom(this.httpService.patch(url, config));
    } catch (error) {
      this.logger.error(
        `Failed to patch path config for ${name}: ${error.message}`,
      );
      throw error;
    }
  }

  async listPaths(): Promise<any> {
    const url = `${this.baseUrl}/v3/paths/list`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to list paths: ${error.message}`);
      throw error;
    }
  }

  async listRecordings(
    path: string,
    start?: string,
    end?: string,
  ): Promise<any> {
    const playbackUrl =
      this.configService.get<string>('MEDIAMTX_PLAYBACK_URL') ??
      'http://localhost:9996';
    const params = new URLSearchParams({ path });
    if (start) params.append('start', start);
    if (end) params.append('end', end);

    const url = `${playbackUrl}/list?${params.toString()}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to list recordings for path ${path}: ${error.message}`,
      );
      throw error;
    }
  }
}
