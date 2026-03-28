import { useCameras } from '@hooks/useCameras';
import MeansStreamSelector from './MeansStreamSelector/MeansStreamSelector';
import VideoTile from '@components/VideoTile';
import { gridItem, gridItemWithVideo, gridVariant } from './VideoGrid.css';
import type { VideoGridProps } from './VideoGrid.types';
import { videoGridCellPlacement } from './videoGridPlacements';
import MeansActionBar from '@components/MeansActionBar';
import { useVideoGridSelectionStore } from '@stores/useVideoGridSelection';

const VideoGrid = ({ count = 3 }: VideoGridProps) => {
  const safeCount = gridVariant[count] ? count : 3;
  const placements = videoGridCellPlacement[safeCount];
  const { data: cameras, isLoading, isError } = useCameras();
  const slotCameraIndexBySlot = useVideoGridSelectionStore(
    (s) => s.slotCameraIndexBySlot,
  );
  const setSlotCameraIndex = useVideoGridSelectionStore(
    (s) => s.setSlotCameraIndex,
  );
  const isThermalBySlot = useVideoGridSelectionStore((s) => s.isThermalBySlot);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !cameras) {
    return <div>Error loading cameras</div>;
  }

  return (
    <div className={gridVariant[safeCount]}>
      {Array.from({ length: safeCount }, (_, i) => {
        const index = slotCameraIndexBySlot[i];
        const camera = index != null ? cameras[index] : undefined;

        return (
          <div
            key={`video-grid-cell-${i}`}
            className={camera ? gridItemWithVideo : gridItem}
            style={placements?.[i]}
          >
            {camera ? (
              <VideoTile
                cameraId={camera.id}
                streamUrl={`http://127.0.0.1:8889/${(camera.hasThermal && isThermalBySlot[i]) ? 'thermal_' : ''}${camera.id}_${i === 0 ? 'high' : 'low'}`}
                bottomBarContent={({
                  toggleFullscreen,
                  onPopOverToggle,
                }: {
                  toggleFullscreen: () => void;
                  onPopOverToggle: (opened: boolean) => void;
                }) => (
                  <MeansActionBar
                    slotIndex={i}
                    cameraId={camera.id}
                    toggleFullscreen={toggleFullscreen}
                    onPopOverToggle={onPopOverToggle}
                  />
                )}
                topBarContent={
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.60)' }}>
                    {camera.name}
                  </div>
                }
              />
            ) : (
              <MeansStreamSelector
                cameras={cameras}
                onSelect={(cameraIndex) => {
                  setSlotCameraIndex(i, cameraIndex);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VideoGrid;
