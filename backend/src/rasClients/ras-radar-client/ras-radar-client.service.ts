import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { RadarWithType, RasRadarDto } from '@/dto';
import { isTimeoutError } from '../utils';

@Injectable()
export class RasRadarClientService {
  private readonly logger = new Logger(RasRadarClientService.name);

  constructor(private readonly httpService: HttpService) {}

  async getRasRadars(): Promise<RadarWithType[]> {
    try {
      const { data } = await this.httpService.axiosRef.get<RadarWithType[]>('');
      return data ?? [];
    } catch (error) {
      this.logger.error('Error getting RAS radars:', error);
      throw error;
    }
  }

  async getRasRadarsWithData(): Promise<RasRadarDto[]> {
    try {
      const { data } =
        await this.httpService.axiosRef.get<RasRadarDto[]>('/full-data');
      return data ?? [];
    } catch (error) {
      this.logger.error('Error getting RAS radars:', error);
      throw error;
    }
  }

  async getRadarData(name: string): Promise<RasRadarDto> {
    try {
      const { data } = await this.httpService.axiosRef.get<RasRadarDto>(
        `/${encodeURIComponent(name)}`,
      );

      return data;
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new Error(
          `Radar service at ${this.httpService.axiosRef.defaults.baseURL} is unreachable. ` +
            `Please verify the service is running and network connectivity is available.`,
        );
      }
      this.logger.error(`Error getting data for radar ${name}:`, error);
      throw error;
    }
  }

  async registerToRadar(
    name: string,
    indicationRoute: { url: string },
  ): Promise<void> {
    try {
      await this.httpService.axiosRef.post(
        `/${encodeURIComponent(name)}/register`,
        indicationRoute,
      );
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new Error(
          `Radar service at ${this.httpService.axiosRef.defaults.baseURL} is unreachable. ` +
            `Please verify the service is running and network connectivity is available.`,
        );
      }
      this.logger.error(`Error registering to radar ${name}:`, error);
      throw error;
    }
  }

  async unRegisterFromRadar(
    name: string,
    indicationRoute: { url: string },
  ): Promise<void> {
    try {
      await this.httpService.axiosRef.post(
        `/${encodeURIComponent(name)}/disconnect`,
        indicationRoute,
      );
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new Error(
          `Radar service at ${this.httpService.axiosRef.defaults.baseURL} is unreachable. ` +
            `Please verify the service is running and network connectivity is available.`,
        );
      }
      this.logger.error(`Error unregistering from radar ${name}:`, error);
      throw error;
    }
  }
}
