import { Injectable, Logger } from '@nestjs/common';
import { RasCameraClientService } from '@/rasClients/ras-camera-client/ras-camera-client.service';
import { DeviceAvailabilityStatusEnum } from '@/enum/enums';

@Injectable()
export class RasCameraService {
  private readonly logger = new Logger(RasCameraService.name);

  constructor(
    private readonly rasCameraClientService: RasCameraClientService,
  ) {}

  async getAllCameraIds() {
    return await this.rasCameraClientService.getRasCameras();
  }

  async getAllCamerasWithData() {
    return (await this.rasCameraClientService.getRasCamerasWithData()).map(camera => {
      return {
        ...camera,
        status: DeviceAvailabilityStatusEnum.AVAILABLE
      }
    });
  }
}
