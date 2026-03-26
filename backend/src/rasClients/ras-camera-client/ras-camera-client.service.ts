import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { RasCameraDto, RasCamerasId } from '@/dto';
import { isTimeoutError } from '../utils';

@Injectable()
export class RasCameraClientService {
  private readonly logger = new Logger(RasCameraClientService.name);

  constructor(private readonly httpService: HttpService) {}

  async getRasCameras(): Promise<RasCamerasId[]> {
    try {
      const { data } = await this.httpService.axiosRef.get<RasCamerasId[]>('');
      return data ?? [];
    } catch (error) {
      this.logger.error('Error getting RAS cameras:', error);
      throw error;
    }
  }

  async getRasCamerasWithData(): Promise<RasCameraDto[]> {
    try {
      const { data } =
        await this.httpService.axiosRef.get<RasCameraDto[]>('/full-data');
      return data ?? [];
    } catch (error) {
      this.logger.error('Error getting RAS cameras with data:', error);
      throw error;
    }
  }

  async getCameraData(id: string): Promise<RasCameraDto> {
    try {
      const { data } = await this.httpService.axiosRef.get<RasCameraDto>(
        `/${encodeURIComponent(id)}`,
      );

      return data;
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new Error(
          `Camera service at ${this.httpService.axiosRef.defaults.baseURL} is unreachable. ` +
            `Please verify the service is running and network connectivity is available.`,
        );
      }
      this.logger.error(`Error getting data for camera ${id}:`, error);
      throw error;
    }
  }
}
