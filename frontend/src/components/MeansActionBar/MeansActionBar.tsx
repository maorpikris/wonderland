import { Flex } from '@mantine/core';
import {
  ControlMeansButton,
  FullscreenMeansButton,
  SwitchMeansButton,
  ReplayMeansButton,
} from './components';

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
    </Flex>
  );
};

export default MeansActionBar;
