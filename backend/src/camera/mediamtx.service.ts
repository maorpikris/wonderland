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
}
