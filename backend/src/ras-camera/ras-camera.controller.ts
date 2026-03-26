import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { RasCameraService } from './ras-camera.service';
import { ScanMissionService } from '../scan-mission/scan-mission.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('cameras')
export class RasCameraController {
  private readonly logger = new Logger(RasCameraController.name);

  constructor(
    private readonly rasCameraService: RasCameraService,
    private readonly scanMissionService: ScanMissionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'get all registered cameras with their data' })
  getAllCamerasWithData() {
    this.logger.log('Getting all cameras with data...');
    return this.rasCameraService.getAllCamerasWithData();
  }

  @Get('/ids')
  @ApiOperation({ summary: 'get all registered camera IDs' })
  getAllCameraIds() {
    this.logger.log('Getting all camera IDs...');
    return this.rasCameraService.getAllCameraIds();
  }

  @Get('/with-scan-missions')
  @ApiOperation({ summary: 'get all cameras with their scan missions' })
  async getCamerasWithMissions() {
    const cameras = await this.rasCameraService.getAllCamerasWithData();
    const result = await Promise.all(
      cameras.map(async (camera) => {
        const missions = await this.scanMissionService.findAllByDeviceId(
          camera.id,
        );
        return {
          id: camera.id,
          name: camera.name,
          scanMissions: missions,
        };
      }),
    );
    return result;
  }

  @Get('/:id/position')
  @ApiOperation({ summary: 'get current position of a camera' })
  async getCameraPosition(@Param('id') id: string) {
    // Mocking the capture of current coordinates
    const secureRandom = () => randomBytes(4).readUInt32BE() / 0xffffffff;
    return {
      type: 'Point',
      coordinates: [
        34.7818 + secureRandom() * 0.01,
        32.0853 + secureRandom() * 0.01,
        10,
      ],
    };
  }

  @Post('/:id/take-control')
  @ApiOperation({ summary: 'take control of a camera' })
  async takeControl(@Param('id') id: string) {
    this.logger.log(`Taking control of camera ${id}...`);
    return { success: true, message: `Control taken for camera ${id}` };
  }

  @Post('/:id/release-control')
  @ApiOperation({ summary: 'release control of a camera' })
  async releaseControl(@Param('id') id: string) {
    this.logger.log(`Releasing control of camera ${id}...`);
    return { success: true, message: `Control released for camera ${id}` };
  }

  @Post('/:id/move-up')
  @ApiOperation({ summary: 'move camera up' })
  async moveUp(@Param('id') id: string) {
    this.logger.log(`Moving camera ${id} up...`);
    return { success: true };
  }

  @Post('/:id/move-down')
  @ApiOperation({ summary: 'move camera down' })
  async moveDown(@Param('id') id: string) {
    this.logger.log(`Moving camera ${id} down...`);
    return { success: true };
  }

  @Post('/:id/rotate-left')
  @ApiOperation({ summary: 'rotate camera left' })
  async rotateLeft(@Param('id') id: string) {
    this.logger.log(`Rotating camera ${id} left...`);
    return { success: true };
  }

  @Post('/:id/rotate-right')
  @ApiOperation({ summary: 'rotate camera right' })
  async rotateRight(@Param('id') id: string) {
    this.logger.log(`Rotating camera ${id} right...`);
    return { success: true };
  }

  @Post('/:id/zoom-in')
  @ApiOperation({ summary: 'zoom in camera' })
  async zoomIn(@Param('id') id: string) {
    this.logger.log(`Zooming camera ${id} in...`);
    return { success: true };
  }

  @Post('/:id/zoom-out')
  @ApiOperation({ summary: 'zoom out camera' })
  async zoomOut(@Param('id') id: string) {
    this.logger.log(`Zooming camera ${id} out...`);
    return { success: true };
  }
}
