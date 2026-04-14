import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CameraService } from './camera.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('cameras')
export class CameraController {
  private readonly logger = new Logger(CameraController.name);

  constructor(private readonly cameraService: CameraService) {}

  @Get()
  @ApiOperation({ summary: 'get all registered cameras with their data' })
  getAllCamerasWithData() {
    this.logger.log('Getting all cameras with data...');
    return this.cameraService.getAllCamerasWithData();
  }

  @Get('/ids')
  @ApiOperation({ summary: 'get all registered camera IDs' })
  getAllCameraIds() {
    this.logger.log('Getting all camera IDs...');
    return this.cameraService.getAllCameraIds();
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

  @Post('/:id/move-up')
  @ApiOperation({ summary: 'move camera up' })
  async moveUp(
    @Param('id') id: string,
    @Query('isThermal') isThermal?: string,
    @Query('sensitivity') sensitivity?: string,
  ) {
    this.logger.log(
      `Moving camera ${id} up (isThermal: ${isThermal}, sensitivity: ${sensitivity})...`,
    );
    const sensitivityValue = sensitivity ? parseFloat(sensitivity) : 1.0;
    await this.cameraService.moveCamera(
      id,
      0,
      1,
      0,
      isThermal === 'true',
      sensitivityValue,
    );
    return { success: true };
  }

  @Post('/:id/move-down')
  @ApiOperation({ summary: 'move camera down' })
  async moveDown(
    @Param('id') id: string,
    @Query('isThermal') isThermal?: string,
    @Query('sensitivity') sensitivity?: string,
  ) {
    this.logger.log(
      `Moving camera ${id} down (isThermal: ${isThermal}, sensitivity: ${sensitivity})...`,
    );
    const sensitivityValue = sensitivity ? parseFloat(sensitivity) : 1.0;
    await this.cameraService.moveCamera(
      id,
      0,
      -1,
      0,
      isThermal === 'true',
      sensitivityValue,
    );
    return { success: true };
  }

  @Post('/:id/rotate-left')
  @ApiOperation({ summary: 'rotate camera left' })
  async rotateLeft(
    @Param('id') id: string,
    @Query('isThermal') isThermal?: string,
    @Query('sensitivity') sensitivity?: string,
  ) {
    this.logger.log(
      `Rotating camera ${id} left (isThermal: ${isThermal}, sensitivity: ${sensitivity})...`,
    );
    const sensitivityValue = sensitivity ? parseFloat(sensitivity) : 1.0;
    await this.cameraService.moveCamera(
      id,
      -1,
      0,
      0,
      isThermal === 'true',
      sensitivityValue,
    );
    return { success: true };
  }

  @Post('/:id/rotate-right')
  @ApiOperation({ summary: 'rotate camera right' })
  async rotateRight(
    @Param('id') id: string,
    @Query('isThermal') isThermal?: string,
    @Query('sensitivity') sensitivity?: string,
  ) {
    this.logger.log(
      `Rotating camera ${id} right (isThermal: ${isThermal}, sensitivity: ${sensitivity})...`,
    );
    const sensitivityValue = sensitivity ? parseFloat(sensitivity) : 1.0;
    await this.cameraService.moveCamera(
      id,
      1,
      0,
      0,
      isThermal === 'true',
      sensitivityValue,
    );
    return { success: true };
  }

  @Post('/:id/zoom-in')
  @ApiOperation({ summary: 'zoom in camera' })
  async zoomIn(
    @Param('id') id: string,
    @Query('isThermal') isThermal?: string,
  ) {
    this.logger.log(`Zooming camera ${id} in (isThermal: ${isThermal})...`);
    await this.cameraService.moveCamera(id, 0, 0, 1, isThermal === 'true');
    return { success: true };
  }

  @Post('/:id/zoom-out')
  @ApiOperation({ summary: 'zoom out camera' })
  async zoomOut(
    @Param('id') id: string,
    @Query('isThermal') isThermal?: string,
  ) {
    this.logger.log(`Zooming camera ${id} out (isThermal: ${isThermal})...`);
    await this.cameraService.moveCamera(id, 0, 0, -1, isThermal === 'true');
    return { success: true };
  }

  @Post('/:id/focus-in')
  @ApiOperation({ summary: 'focus in camera' })
  async focusIn(
    @Param('id') id: string,
    @Query('isThermal') isThermal?: string,
  ) {
    this.logger.log(`Focusing camera ${id} in (isThermal: ${isThermal})...`);
    await this.cameraService.focusCamera(id, 1, isThermal === 'true');
    return { success: true };
  }

  @Post('/:id/focus-out')
  @ApiOperation({ summary: 'focus out camera' })
  async focusOut(
    @Param('id') id: string,
    @Query('isThermal') isThermal?: string,
  ) {
    this.logger.log(`Focusing camera ${id} out (isThermal: ${isThermal})...`);
    await this.cameraService.focusCamera(id, -1, isThermal === 'true');
    return { success: true };
  }

  @Post('/:id/day-night-mode')
  @ApiOperation({ summary: 'set day or night mode on the camera' })
  async setDayNightMode(
    @Param('id') id: string,
    @Body('mode') mode: 'day' | 'night',
  ) {
    this.logger.log(`Changing day/night mode for camera ${id} to ${mode}...`);
    await this.cameraService.setCameraMode(id, mode);
    return { success: true };
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'update camera metadata' })
  async patchCamera(@Param('id') id: string, @Body() updateData: any) {
    this.logger.log(`Patching camera ${id}...`);
    return this.cameraService.updateCamera(id, updateData);
  }
}
