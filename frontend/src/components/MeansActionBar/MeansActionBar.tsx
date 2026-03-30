import { Flex } from '@mantine/core';
import {
  ControlMeansButton,
  FullscreenMeansButton,
  SwitchMeansButton,
  ReplayMeansButton,
  ThermalMeansButton,
  ResolutionMeansButton,
} from './components';
import { useCameras } from '@hooks/useCameras';
import { useVideoGridSelectionStore } from '@stores/useVideoGridSelection';

type MeansActionBarProps = {
  slotIndex: number;
  cameraId: string;
  toggleFullscreen: () => void;
  onPopOverToggle: (opened: boolean) => void;
};

const MeansActionBar = ({
  slotIndex,
  cameraId,
  toggleFullscreen,
  onPopOverToggle,
}: MeansActionBarProps) => {
  const { data: cameras } = useCameras();
  const camera = cameras?.find((c) => c.id === cameraId);
  const hasThermal = camera?.hasThermal || false;
  const isThermal = useVideoGridSelectionStore(
    (s) => s.isThermalBySlot[slotIndex] || false,
  );

  return (
    <Flex
      mih={50}
      gap="10px"
      justify="flex-start"
      align="center"
      direction="row"
      wrap="wrap"
      p="0 12px"
    >
      <ControlMeansButton
        cameraId={cameraId}
        isThermal={isThermal}
        onPopOverToggle={onPopOverToggle}
      />
      <ReplayMeansButton
        slotIndex={slotIndex}
        cameraId={cameraId}
        onPopOverToggle={onPopOverToggle}
      />
      <FullscreenMeansButton toggleFullscreen={toggleFullscreen} />
      <SwitchMeansButton
        slotIndex={slotIndex}
        onPopOverToggle={onPopOverToggle}
      />
      {hasThermal && <ThermalMeansButton slotIndex={slotIndex} />}
      {slotIndex === 0 && (
        <ResolutionMeansButton
          slotIndex={slotIndex}
          onPopOverToggle={onPopOverToggle}
        />
      )}
    </Flex>
  );
};

export default MeansActionBar;
