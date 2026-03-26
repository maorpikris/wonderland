import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ScanMissionService, ScanMission } from './scan-mission.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateScanMissionDto, ScanMissionDto, UpdateScanMissionDto } from './dto/scan-mission.dto';

@Controller('scan-missions')
export class ScanMissionController {
  private readonly logger = new Logger(ScanMissionController.name);

  constructor(private readonly scanMissionService: ScanMissionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all scan missions' })
  @ApiResponse({ status: 200, type: [ScanMissionDto] })
  findAll() {
    return this.scanMissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single scan mission' })
  findOne(@Param('id') id: string) {
    return this.scanMissionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new scan mission' })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateScanMissionDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: ScanMissionDto })
  create(@Body() data: CreateScanMissionDto) {
    return this.scanMissionService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing scan mission' })
  @ApiBody({ type: UpdateScanMissionDto })
  update(@Param('id') id: string, @Body() data: UpdateScanMissionDto) {
    return this.scanMissionService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scan mission' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.scanMissionService.delete(id);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Start/Stop a scan mission' })
  toggle(@Param('id') id: string) {
    return this.scanMissionService.toggleActive(id);
  }
}
