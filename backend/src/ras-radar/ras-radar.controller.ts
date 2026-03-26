import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RasRadarService } from './ras-radar.service';
import { RasRadarDto } from '@/dto';

@ApiTags('radars')
@Controller('radars')
export class RasRadarController {
  private readonly logger = new Logger(RasRadarController.name);

  constructor(private readonly rasRadarService: RasRadarService) {}

  @Get()
  @ApiOperation({ summary: 'get all registered radars with their data' })
  async getRadarsWithData(): Promise<RasRadarDto[]> {
    this.logger.log('Getting radars with data...');
    return await this.rasRadarService.getRasRadarsWithData();
  }

  @Get('/names')
  @ApiOperation({ summary: 'get all registered radar names' })
  async getRadars(): Promise<string[]> {
    this.logger.log('Getting radar names...');
    return await this.rasRadarService.getRasRadars();
  }
}
