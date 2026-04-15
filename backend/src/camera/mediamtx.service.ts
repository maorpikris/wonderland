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
  runOnInit?: string;
  runOnInitRestart?: boolean;
  runOnDemand?: string;
  runOnDemandRestart?: boolean;
  record?: boolean;
  recordPath?: string;
  recordFormat?: 'fmp4' | 'ts';
  recordPartDuration?: string;
  recordPartMaxSize?: string;
  recordSegmentDuration?: string;
  recordDeleteAfter?: string;
}

type MediaMTXPathState = {
  source?: string;
  sourceOnDemand?: boolean;
  runOnInit?: string;
  runOnInitRestart?: boolean;
  runOnDemand?: string;
  runOnDemandRestart?: boolean;
  record?: boolean;
  recordPath?: string;
};

type AxiosLikeError = {
  response?: {
    status?: number;
    data?: {
      error?: unknown;
    };
  };
  message?: unknown;
  stack?: unknown;
};

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

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unknown error';
  }

  private getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error && typeof error.stack === 'string') {
      return error.stack;
    }
    return undefined;
  }

  private isAlreadyExistsError(error: unknown): boolean {
    const axiosError = error as AxiosLikeError;
    return (
      axiosError.response?.status === 400 &&
      typeof axiosError.response?.data?.error === 'string' &&
      axiosError.response.data.error.includes('already exists')
    );
  }

  private extractErrorDetail(error: unknown): string {
    const axiosError = error as AxiosLikeError;
    if (typeof axiosError.response?.data?.error === 'string') {
      return axiosError.response.data.error;
    }
    return this.toErrorMessage(error);
  }

  async addPath(config: MediaMTXPathConfig): Promise<void> {
    const url = `${this.baseUrl}/v3/config/paths/add/${config.name}`;
    const desiredRunOnInit = config.runOnInit ?? '';
    const desiredRunOnInitRestart = config.runOnInitRestart ?? false;
    const desiredRunOnDemand = config.runOnDemand ?? '';
    const desiredRunOnDemandRestart = config.runOnDemandRestart ?? false;
    const desiredSourceOnDemand = config.sourceOnDemand ?? true;
    const desiredRecord = config.record ?? false;
    const payload = {
      source: config.source,
      sourceOnDemand: desiredSourceOnDemand,
      runOnInit: desiredRunOnInit,
      runOnInitRestart: desiredRunOnInitRestart,
      runOnDemand: desiredRunOnDemand,
      runOnDemandRestart: desiredRunOnDemandRestart,
      record: desiredRecord,
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
    } catch (error: unknown) {
      if (this.isAlreadyExistsError(error)) {
        this.logger.warn(
          `Path ${config.name} already exists in MediaMTX. Checking for config mismatch...`,
        );

        try {
          const currentConfig = await this.getPathConfig(config.name);

          if (!currentConfig) {
            this.logger.warn(
              `Could not read current config for ${config.name}. Skipping patch.`,
            );
            return;
          }

          const patchPayload: Record<string, unknown> = {};

          if (currentConfig.source !== config.source) {
            patchPayload.source = config.source;
          }
          if (
            (currentConfig.sourceOnDemand ?? true) !== desiredSourceOnDemand
          ) {
            patchPayload.sourceOnDemand = desiredSourceOnDemand;
          }
          if ((currentConfig.runOnInit ?? '') !== desiredRunOnInit) {
            patchPayload.runOnInit = desiredRunOnInit;
          }
          if (
            (currentConfig.runOnInitRestart ?? false) !==
            desiredRunOnInitRestart
          ) {
            patchPayload.runOnInitRestart = desiredRunOnInitRestart;
          }
          if ((currentConfig.runOnDemand ?? '') !== desiredRunOnDemand) {
            patchPayload.runOnDemand = desiredRunOnDemand;
          }
          if (
            (currentConfig.runOnDemandRestart ?? false) !==
            desiredRunOnDemandRestart
          ) {
            patchPayload.runOnDemandRestart = desiredRunOnDemandRestart;
          }
          if ((currentConfig.record ?? false) !== desiredRecord) {
            patchPayload.record = desiredRecord;
          }
          if ((currentConfig.recordPath ?? '') !== (config.recordPath ?? '')) {
            patchPayload.recordPath = config.recordPath ?? '';
          }

          if (Object.keys(patchPayload).length > 0) {
            this.logger.log(
              `Config mismatch for ${config.name}. Patching path config...`,
            );
            await this.patchPath(config.name, patchPayload);
            this.logger.log(`Successfully patched path config: ${config.name}`);
          } else {
            this.logger.log(
              `Path config matches for ${config.name}. No update needed.`,
            );
          }
        } catch (getConfigError: unknown) {
          this.logger.error(
            `Failed to verify/update existing path ${config.name}: ${this.toErrorMessage(getConfigError)}`,
          );
        }
        return;
      }

      this.logger.error(
        `Failed to register path ${config.name}: ${this.extractErrorDetail(error)}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async getPathConfig(name: string): Promise<MediaMTXPathState | null> {
    const url = `${this.baseUrl}/v3/config/paths/get/${name}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data as MediaMTXPathState | null;
      return data ?? null;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get path config for ${name}: ${this.toErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async patchPath(
    name: string,
    config: Record<string, unknown>,
  ): Promise<void> {
    const url = `${this.baseUrl}/v3/config/paths/patch/${name}`;
    try {
      await firstValueFrom(this.httpService.patch(url, config));
    } catch (error: unknown) {
      this.logger.error(
        `Failed to patch path config for ${name}: ${this.toErrorMessage(error)}`,
      );
      throw error;
    }
  }

  async listPaths(): Promise<any> {
    const url = `${this.baseUrl}/v3/paths/list`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error: unknown) {
      this.logger.error(`Failed to list paths: ${this.toErrorMessage(error)}`);
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
    } catch (error: unknown) {
      this.logger.error(
        `Failed to list recordings for path ${path}: ${this.toErrorMessage(error)}`,
      );
      throw error;
    }
  }
}
