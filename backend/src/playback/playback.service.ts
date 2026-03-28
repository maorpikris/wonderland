import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  MediaMTXRecordingResponse,
  PlaybackRequest,
  ChannelRecordingsPlaylist,
  MediaMTXRecordingSegment,
} from './types';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PlaybackService {
  private readonly logger = new Logger(PlaybackService.name);

  private readonly mediamtxPlaybackUrl: string;
  private readonly storageBaseUrl: string;
  private readonly appBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.mediamtxPlaybackUrl =
      this.configService.get<string>('MEDIAMTX_PLAYBACK_URL') ||
      'http://localhost:9996';
    this.storageBaseUrl =
      this.configService.get<string>('STORAGE_BASE_URL') ||
      'http://localhost:3000/static';
    this.appBaseUrl = this.storageBaseUrl.replace('/static', '');
  }

  async getPlayback(
    payload: PlaybackRequest,
  ): Promise<ChannelRecordingsPlaylist> {
    const { cameraId, start, end } = payload;
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();

    try {
      const highPath = `${cameraId}_high`;
      const lowPath = `${cameraId}_low`;

      const [highSegments, lowSegments] = await Promise.all([
        this.fetchSegmentsFromMediaMTX(highPath, start, end),
        this.fetchSegmentsFromMediaMTX(lowPath, start, end),
      ]);

      if (highSegments.length === 0 && lowSegments.length === 0) {
        throw new NotFoundException('No recordings found for this time range');
      }

      const unifiedSegments: MediaMTXRecordingSegment[] = [];
      let currentTimeMs = startMs;

      // Helper function to find a file in the directory that matches the start time
      const resolveFileUrl = (channelPath: string, isoStart: string) => {
        const baseDir = path.resolve(
          __dirname,
          '..',
          '..',
          '..',
          'recordings',
          channelPath,
        );
        if (!fs.existsSync(baseDir)) return null;

        const files = fs.readdirSync(baseDir);
        // Format of isoStart: 2024-03-27T19:37:32.917581Z
        // Format of file: 2024-03-27_19-37-32-917581.mp4 (example)
        // Let's try to find a file that starts with the same YYYY-MM-DD_HH-mm-ss
        const datePart = isoStart
          .split('.')[0]
          .replace('T', '_')
          .replace(/:/g, '-');
        const match = files.find((f) => f.startsWith(datePart));

        return match ? `/recordings/${channelPath}/${match}` : null;
      };

      // Helper function to fill gap with low-res segments
      const fillWithLow = (gapStart: number, gapEnd: number) => {
        const relevantLow = lowSegments.filter((low) => {
          const lowStart = new Date(low.start).getTime();
          const lowEnd = lowStart + low.duration * 1000;
          return lowEnd > gapStart && lowStart < gapEnd;
        });

        for (const low of relevantLow) {
          const lowStartMs = new Date(low.start).getTime();
          const lowEndMs = lowStartMs + low.duration * 1000;

          // Trim low segment to fit perfectly in the gap
          const actualStartMs = Math.max(lowStartMs, gapStart);
          const actualEndMs = Math.min(lowEndMs, gapEnd);
          const actualDuration = (actualEndMs - actualStartMs) / 1000;

          if (actualDuration > 0) {
            const url = resolveFileUrl(lowPath, low.start);
            if (url) {
              unifiedSegments.push({
                start: low.start,
                duration: low.duration,
                url: `${this.appBaseUrl}${url}`,
              });
            }
          }
        }
      };

      // Sort segments to ensure sequential processing
      const sortedHigh = [...highSegments].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

      for (const seg of sortedHigh) {
        const segStartMs = new Date(seg.start).getTime();
        const segEndMs = segStartMs + seg.duration * 1000;

        if (segEndMs <= currentTimeMs) continue;
        if (segStartMs >= endMs) break;

        if (segStartMs > currentTimeMs) {
          fillWithLow(currentTimeMs, segStartMs);
        }

        const url = resolveFileUrl(highPath, seg.start);
        if (url) {
          unifiedSegments.push({
            start: seg.start,
            duration: seg.duration,
            url: `${this.appBaseUrl}${url}`,
          });
        }
        currentTimeMs = segEndMs;
      }

      if (currentTimeMs < endMs) {
        fillWithLow(currentTimeMs, endMs);
      }

      return {
        metadata: {
          cameraId,
          serverTime: new Date().toISOString(),
        },
        playlist: unifiedSegments,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate playback: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async listRecordings(cameraId: string, date: string) {
    const highPath = `${cameraId}_high`;
    const lowPath = `${cameraId}_low`;

    const highDir = path.resolve(__dirname, '..', '..', '..', 'recordings', highPath);
    const lowDir = path.resolve(__dirname, '..', '..', '..', 'recordings', lowPath);

    const parseFilename = (filename: string) => {
      const nameWithoutExt = filename.replace('.mp4', '');
      const parts = nameWithoutExt.split('_');
      if (parts.length < 2) return null;

      const datePart = parts[0];
      const timePart = parts[1];
      const sub = timePart.split('-');
      if (sub.length < 3) return null;

      const iso = `${datePart}T${sub[0]}:${sub[1]}:${sub[2]}.${(sub[3] || '000').slice(0, 3)}Z`;
      return { iso, ms: new Date(iso).getTime(), hour: sub[0] };
    };

    const getSegments = (dir: string, channelPath: string, quality: 'high' | 'low') => {
      if (!fs.existsSync(dir)) return [];
      const files = fs.readdirSync(dir)
        .filter((f) => f.startsWith(date) && f.endsWith('.mp4'))
        .sort();

      return files.map((filename, i) => {
        const parsed = parseFilename(filename);
        if (!parsed) return null;

        const filePath = path.join(dir, filename);
        const stats = fs.statSync(filePath);
        
        let duration = 0;
        const nextFile = files[i + 1];
        if (nextFile) {
          const nextParsed = parseFilename(nextFile);
          if (nextParsed) {
            duration = Math.max(0, (nextParsed.ms - parsed.ms) / 1000);
          }
        }
        
        // If it's the last file OR distance calculation failed, use file mtime
        if (duration === 0) {
          duration = Math.max(0, (stats.mtimeMs - parsed.ms) / 1000);
        }

        return {
          start: parsed.iso,
          duration,
          url: `${this.appBaseUrl}/recordings/${channelPath}/${filename}`,
          quality,
        };
      }).filter(Boolean) as MediaMTXRecordingSegment[];
    };

    const allSegments = [
      ...getSegments(highDir, highPath, 'high'),
      ...getSegments(lowDir, lowPath, 'low'),
    ];

    const grouped: Record<string, MediaMTXRecordingSegment[]> = {};

    for (const seg of allSegments) {
      // Group by the start of the hour in ISO format: YYYY-MM-DDT[HH]:00:00.000Z
      const dateObj = new Date(seg.start);
      dateObj.setUTCMonth(dateObj.getUTCMonth()); // stay in UTC
      dateObj.setUTCMinutes(0);
      dateObj.setUTCSeconds(0);
      dateObj.setUTCMilliseconds(0);
      const hourKey = dateObj.toISOString();

      if (!grouped[hourKey]) {
        grouped[hourKey] = [];
      }
      grouped[hourKey].push(seg);
    }

    // Sort hours
    const sortedHours = Object.keys(grouped).sort();
    const result: Record<string, MediaMTXRecordingSegment[]> = {};

    for (const hour of sortedHours) {
      result[hour] = grouped[hour].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    }

    return result;
  }

  private async fetchSegmentsFromMediaMTX(
    path: string,
    start: string,
    end: string,
  ): Promise<MediaMTXRecordingSegment[]> {
    const playbackUrl =
      this.configService.get<string>('MEDIAMTX_PLAYBACK_URL') ||
      'http://localhost:9996';
    const url = `${playbackUrl}/list`;
    try {
      const response = await axios.get<MediaMTXRecordingSegment[]>(url, {
        params: { path, start, end },
      });
      return response.data || [];
    } catch (error) {
      this.logger.warn(
        `Failed to fetch recordings for path ${path}: ${error.message}`,
      );
      return [];
    }
  }
}
