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
  }

  async addPath(config: MediaMTXPathConfig): Promise<void> {
    const url = `${this.baseUrl}/v3/config/paths/add/${config.name}`;
    try {
      await firstValueFrom(
        this.httpService.post(url, {
          source: config.source,
          sourceOnDemand: config.sourceOnDemand ?? true,
          record: config.record ?? false,
          recordPath: config.recordPath,
          recordFormat: config.recordFormat ?? 'fmp4',
          recordPartDuration: config.recordPartDuration ?? '10s',
          recordSegmentDuration: config.recordSegmentDuration ?? '10m',
          recordDeleteAfter: config.recordDeleteAfter ?? '10d',
          playback: true,
        }),
      );
      this.logger.log(`Successfully registered path: ${config.name}`);
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.error?.includes('already exists')
      ) {
        this.logger.warn(`Path ${config.name} already exists in MediaMTX`);
        return;
      }

      this.logger.error(
        `Failed to register path ${config.name}: ${error.message}`,
        error.stack,
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
