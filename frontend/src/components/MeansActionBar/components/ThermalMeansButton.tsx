import { Sun, Moon } from 'lucide-react';
import { useVideoGridSelectionStore } from '@stores/useVideoGridSelection';
import MeansActionButton from './MeansActionButton';
import { useCameras } from '@hooks/useCameras';
import { setCameraDayNightMode } from '@src/api/cameras.api';

type ThermalMeansButtonProps = {
  slotIndex: number;
  cameraId: string;
};

const ThermalMeansButton = ({
  slotIndex,
  cameraId,
}: ThermalMeansButtonProps) => {
  const { data: cameras } = useCameras();
  const camera = cameras?.find((c) => c.id === cameraId);
  const isThermal = useVideoGridSelectionStore(
    (s) => s.isThermalBySlot[slotIndex] || false,
  );
  const toggleThermal = useVideoGridSelectionStore((s) => s.toggleThermal);

  const handleToggle = async () => {
    const isCurrentlyNight = isThermal; // isThermal acts as "is night" here
    const newMode = isCurrentlyNight ? 'day' : 'night';

    if (camera?.dayNightModeStrategy === 'api') {
      try {
        await setCameraDayNightMode(cameraId, newMode);
      } catch (error) {
        console.error('Failed to set day/night mode via API', error);
      }
    }

    toggleThermal(slotIndex);
  };

  return (
    <MeansActionButton onClick={handleToggle}>
      {isThermal ? <Moon size={15} /> : <Sun size={15} />}
    </MeansActionButton>
  );
};

export default ThermalMeansButton;
