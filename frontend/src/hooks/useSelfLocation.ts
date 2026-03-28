import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSelfLocation, updateSelfLocation } from '../api/selfLocation.api';

const SELF_LOCATION_QUERY_KEY = ['selfLocation'];

export const useSelfLocation = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SELF_LOCATION_QUERY_KEY,
    queryFn: getSelfLocation,
  });

  const mutation = useMutation({
    mutationFn: updateSelfLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELF_LOCATION_QUERY_KEY });
    },
  });

  return {
    location: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateLocation: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};
