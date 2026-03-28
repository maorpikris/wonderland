import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CameraGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CameraGateway.name);

  afterInit(server: Server) {
    this.logger.log('Camera WebSocket Gateway initialized');
  }

  broadcastCameraUpdate(data: { id: string; azimuth: number; fov: number }) {
    this.server.emit('cameraUpdate', data);
  }

  broadcastCameraStatusUpdate(data: { id: string; availability: string }) {
    this.server.emit('cameraStatusUpdate', data);
  }
}
