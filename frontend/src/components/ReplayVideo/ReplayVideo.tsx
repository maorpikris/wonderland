import { useEffect, useRef, useState } from 'react';
import { Loader, Center, Text, Box } from '@mantine/core';
import Hls from 'hls.js';

interface Recording {
  start: string;
  duration: number;
  url: string;
}

interface ReplayVideoProps {
  cameraId: string;
  startTime: string; // ISO string
  className?: string;
  onTimeUpdate?: (time: string) => void;
}

const backendUrl =
  import.meta.env.VITE_MAGENIM_BACKEND_URL || 'http://localhost:3000';

const ReplayVideo = ({
  cameraId,
  startTime,
  className,
  onTimeUpdate,
}: ReplayVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [currentSegment, setCurrentSegment] = useState<Recording | null>(null);
  const [allRecordings, setAllRecordings] = useState<{
    high: Recording[];
    low: Recording[];
  }>({ high: [], low: [] });
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const currentVideoSrcStartTimeRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noVideo, setNoVideo] = useState(false);

  const lastReportedTimeRef = useRef<string>(startTime);

  const fetchAllMetadata = async (time: string) => {
    setIsMetadataLoading(true);
    try {
      const start = new Date(
        new Date(time).getTime() - 12 * 3600000,
      ).toISOString();
      const end = new Date(
        new Date(time).getTime() + 12 * 3600000,
      ).toISOString();
      const response = await fetch(
        `${backendUrl}/cameras/${cameraId}/recordings?start=${start}&end=${end}`,
      );
      if (!response.ok) throw new Error('Failed to fetch recordings');
      const data = await response.json();
      setAllRecordings({
        high: data.high || [],
        low: data.low || [],
      });
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    } finally {
      setIsMetadataLoading(false);
    }
  };

  const fetchSegment = async (time: string, force = false) => {
    const targetMs = new Date(time).getTime();

    if (
      !force &&
      currentSegment &&
      Math.abs(targetMs - currentVideoSrcStartTimeRef.current) < 500
    ) {
      return;
    }

    setNoVideo(false);
    setError(null);

    const findBest = (segments: Recording[]) => {
      return segments.find((s) => {
        const sStart = new Date(s.start).getTime();
        const sEnd = sStart + s.duration * 1000;
        return targetMs >= sStart && targetMs < sEnd;
      });
    };

    let best = findBest(allRecordings.high);
    if (!best) {
      best = findBest(allRecordings.low);
    }

    if (best) {
      const path = best.url.split('path=')[1].split('&')[0];
      const segmentEndMs =
        new Date(best.start).getTime() + best.duration * 1000;

      // Check if we can just seek in the current stream
      if (!force && videoRef.current && videoRef.current.src) {
        if (
          targetMs >= currentVideoSrcStartTimeRef.current &&
          targetMs < segmentEndMs
        ) {
          const offset =
            (targetMs - currentVideoSrcStartTimeRef.current) / 1000;
          if (Math.abs(videoRef.current.currentTime - offset) > 0.5) {
            videoRef.current.currentTime = offset;
          }
          return;
        }
      }

      const requestedStartEncoded = encodeURIComponent(time);
      const duration = Math.min(600, best.duration);
      // SWITCH TO m3u8 format
      const playbackUrl = `http://127.0.0.1:8888/${path}/index.m3u8?start=${requestedStartEncoded}`;

      setCurrentSegment({ ...best, url: playbackUrl });
      currentVideoSrcStartTimeRef.current = targetMs;

      if (videoRef.current) {
        setIsLoading(true);
        if (Hls.isSupported()) {
          if (!hlsRef.current) {
            hlsRef.current = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hlsRef.current.attachMedia(videoRef.current);
          }
          hlsRef.current.loadSource(playbackUrl);
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current?.play().catch(console.error);
          });
          hlsRef.current.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              console.error('HLS fatal error:', data.type);
              hlsRef.current?.destroy();
              hlsRef.current = null;
              setError(`HLS error: ${data.type}`);
            }
          });
        } else if (
          videoRef.current.canPlayType('application/vnd.apple.mpegurl')
        ) {
          // Fallback for Safari
          videoRef.current.src = playbackUrl;
          videoRef.current.addEventListener('loadedmetadata', () => {
            videoRef.current?.play().catch(console.error);
          });
        } else {
          setError('HLS is not supported in this browser');
        }
      }
    } else {
      if (!isMetadataLoading) {
        setNoVideo(true);
        setCurrentSegment(null);
      }
    }
  };

  useEffect(() => {
    fetchAllMetadata(startTime);
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [cameraId]);

  useEffect(() => {
    fetchSegment(startTime);
  }, [startTime, allRecordings]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlaying = () => setIsLoading(false);
    video.addEventListener('playing', onPlaying);
    return () => video.removeEventListener('playing', onPlaying);
  }, []);

  const handleEnded = () => {
    if (!currentSegment || !videoRef.current) return;
    const currentTimeMs =
      currentVideoSrcStartTimeRef.current + videoRef.current.currentTime * 1000;
    fetchSegment(new Date(currentTimeMs).toISOString(), true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && currentSegment) {
      const currentTimeMs =
        currentVideoSrcStartTimeRef.current +
        videoRef.current.currentTime * 1000;
      const currentTimeStr = new Date(currentTimeMs).toISOString();
      lastReportedTimeRef.current = currentTimeStr;
      onTimeUpdate?.(currentTimeStr);
    }
  };

  return (
    <Box className={className} pos="relative" bg="black" w="100%" h="100%">
      <video
        ref={videoRef}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        controls={false}
        muted
        width="100%"
        height="100%"
        style={{ objectFit: 'contain' }}
      />

      {isLoading && (
        <Center pos="absolute" inset={0} bg="rgba(0,0,0,0.5)">
          <Loader size="lg" />
        </Center>
      )}

      {noVideo && (
        <Center pos="absolute" inset={0} bg="black">
          <Text c="white" fw={700}>
            אין הקלטה לזמן זה (No recording for this time)
          </Text>
        </Center>
      )}

      {error && (
        <Center pos="absolute" inset={0} bg="black">
          <Text c="red" fw={700}>
            שגיאה: {error}
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default ReplayVideo;
