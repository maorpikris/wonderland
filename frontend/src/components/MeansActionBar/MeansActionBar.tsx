import { Flex } from '@mantine/core';
import {
  ControlMeansButton,
  FullscreenMeansButton,
  SwitchMeansButton,
  ReplayMeansButton,
  ThermalMeansButton,
} from './components';
import { useCameras } from '@hooks/useCameras';

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
    </Flex>
  );
};

export default MeansActionBar;
