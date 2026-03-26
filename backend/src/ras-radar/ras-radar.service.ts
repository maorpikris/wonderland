import { Injectable, Logger } from '@nestjs/common';
import { RasRadarClientService } from '@/rasClients/ras-radar-client/ras-radar-client.service';
import { RadarType } from '@/enum';
import { RasRadarDto } from '@/dto';

@Injectable()
export class RasRadarService {
  private readonly logger = new Logger(RasRadarService.name);

  constructor(private readonly rasRadarClientService: RasRadarClientService) {}

  private filterByType<T extends { type: RadarType }>(
    list: T[],
    type: RadarType,
  ): T[] {
    return list.filter((r) => r.type === type);
  }

  async getRasRadars(): Promise<string[]> {
    const list = await this.rasRadarClientService.getRasRadars();

    return this.filterByType(list, RadarType.KELA).map((r) => r.name);
  }

  async getRasRadarsWithData(): Promise<RasRadarDto[]> {
    const list = await this.rasRadarClientService.getRasRadarsWithData();

    return this.filterByType(list, RadarType.KELA);
  }
}
