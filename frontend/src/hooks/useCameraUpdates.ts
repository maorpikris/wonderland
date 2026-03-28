import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { camerasQueryKey } from './useCameras';
import type { Camera } from '../types';

export interface CameraUpdate {
  id: string;
  azimuth: number;
  fov: number;
}

export interface CameraStatusUpdate {
  id: string;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
}

export const useCameraUpdates = () => {
  const [updates, setUpdates] = useState<Record<string, CameraUpdate>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    // Assuming backend runs on the same host, port 3000
    const socket: Socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to camera websocket');
    });

    socket.on('cameraUpdate', (data: CameraUpdate) => {
      setUpdates((prev) => ({
        ...prev,
        [data.id]: data,
      }));
    });

    socket.on('cameraStatusUpdate', (data: CameraStatusUpdate) => {
      console.log('Camera status update received:', data);
      queryClient.setQueryData<Camera[]>(camerasQueryKey, (oldCameras) => {
        if (!oldCameras) return oldCameras;
        return oldCameras.map((camera) =>
          camera.id === data.id
            ? { ...camera, availability: data.availability }
            : camera,
        );
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return updates;
};
