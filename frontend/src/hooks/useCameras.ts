import { getCameras, updateCamera } from '@api';
import type { Camera } from '@src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const camerasQueryKey = ['cameras'] as const;

export function useCameras() {
  return useQuery<Camera[]>({
    queryKey: camerasQueryKey,
    queryFn: getCameras,
  });
}

export function useUpdateCamera() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Camera> }) =>
      updateCamera(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: camerasQueryKey });
    },
  });
}
