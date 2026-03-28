import type { Camera } from '@src/types';
import axios from 'axios';

const backendUrl =
  import.meta.env.VITE_MAGENIM_BACKEND_URL || 'http://localhost:3000';

export const getCameras = async (): Promise<Camera[]> => {
  const response = await axios.get<Camera[]>(`${backendUrl}/cameras`);
  return response.data;
};

export const moveUp = (id: string) => axios.post(`${backendUrl}/cameras/${id}/move-up`);
export const moveDown = (id: string) => axios.post(`${backendUrl}/cameras/${id}/move-down`);
export const rotateLeft = (id: string) => axios.post(`${backendUrl}/cameras/${id}/rotate-left`);
export const rotateRight = (id: string) => axios.post(`${backendUrl}/cameras/${id}/rotate-right`);
export const zoomIn = (id: string) => axios.post(`${backendUrl}/cameras/${id}/zoom-in`);
export const zoomOut = (id: string) => axios.post(`${backendUrl}/cameras/${id}/zoom-out`);

export const updateCamera = (id: string, data: Partial<Camera>) =>
  axios.patch(`${backendUrl}/cameras/${id}`, data);

export const getRecordings = async (
  id: string,
  start?: string,
  end?: string,
) => {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  const response = await axios.get(
    `${backendUrl}/cameras/${id}/recordings?${params.toString()}`,
  );
  return response.data;
};
