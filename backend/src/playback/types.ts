import { IsString, IsNotEmpty } from 'class-validator';

export interface MediaMTXRecordingSegment {
  start: string; // RFC3339
  duration: number; // seconds
  url: string; // filename
  quality?: 'high' | 'low';
}

export interface MediaMTXRecordingResponse {
  segments: MediaMTXRecordingSegment[];
}

export class PlaybackRequest {
  @IsString()
  @IsNotEmpty()
  cameraId: string;

  @IsString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsNotEmpty()
  end: string;
}

export class ChannelRecordingsPlaylist {
  metadata: {
    cameraId: string;
    serverTime: string;
  };
  playlist: MediaMTXRecordingSegment[];
}
