import type { Camera } from '@src/types';
import axios from 'axios';

const backendUrl =
  import.meta.env.VITE_MAGENIM_BACKEND_URL || 'http://localhost:3000';

export const getCameras = async (): Promise<Camera[]> => {
  const response = await axios.get<Camera[]>(`${backendUrl}/cameras`);
  return response.data;
};

export const moveUp = (id: string, isThermal?: boolean) => axios.post(`${backendUrl}/cameras/${id}/move-up${isThermal ? '?isThermal=true' : ''}`);
export const moveDown = (id: string, isThermal?: boolean) => axios.post(`${backendUrl}/cameras/${id}/move-down${isThermal ? '?isThermal=true' : ''}`);
export const rotateLeft = (id: string, isThermal?: boolean) => axios.post(`${backendUrl}/cameras/${id}/rotate-left${isThermal ? '?isThermal=true' : ''}`);
export const rotateRight = (id: string, isThermal?: boolean) => axios.post(`${backendUrl}/cameras/${id}/rotate-right${isThermal ? '?isThermal=true' : ''}`);
export const zoomIn = (id: string, isThermal?: boolean) => axios.post(`${backendUrl}/cameras/${id}/zoom-in${isThermal ? '?isThermal=true' : ''}`);
export const zoomOut = (id: string, isThermal?: boolean) => axios.post(`${backendUrl}/cameras/${id}/zoom-out${isThermal ? '?isThermal=true' : ''}`);

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
