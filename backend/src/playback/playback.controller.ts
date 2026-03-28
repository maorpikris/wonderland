import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { PlaybackService } from './playback.service';
import { PlaybackRequest, ChannelRecordingsPlaylist } from './types';

@Controller('recordings')
export class StandalonePlaybackController {
  constructor(private readonly playbackService: PlaybackService) {}

  @Get('play')
  async getPlayback(
    @Query(new ValidationPipe({ transform: true })) query: PlaybackRequest,
  ): Promise<ChannelRecordingsPlaylist> {
    return this.playbackService.getPlayback(query);
  }

  @Get('list')
  async listRecordings(
    @Query('cameraId') cameraId: string,
    @Query('date') date: string, // YYYY-MM-DD
  ) {
    return this.playbackService.listRecordings(cameraId, date);
  }
}
