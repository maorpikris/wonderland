import { GameController } from '@phosphor-icons/react';
import { Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MeansActionButton from './MeansActionButton';
import PTZControl from './PTZControl/PTZControl';

type ControlMeansButtonProps = {
  cameraId: string;
  isThermal: boolean;
  onPopOverToggle: (opened: boolean) => void;
};
const ControlMeansButton = ({ cameraId, isThermal, onPopOverToggle }: ControlMeansButtonProps) => {
  const [opened, { close, toggle }] = useDisclosure(false, {
    onOpen: () => onPopOverToggle(true),
    onClose: () => onPopOverToggle(false),
  });

  return (
    <Popover
      opened={opened}
      onClose={close}
      position="top-start"
      offset={10}
      shadow="md"
      withinPortal={false}
      styles={{
        dropdown: {
          padding: 0,
          border: 'none',
          backgroundColor: 'transparent',
          zIndex: 1000,
        }
      }}
    >
      <Popover.Target>
        <div style={{ display: 'inline-block' }}>
          <MeansActionButton onClick={toggle}>
            <GameController size={15} />
          </MeansActionButton>
        </div>
      </Popover.Target>

      <Popover.Dropdown>
        <PTZControl cameraId={cameraId} isThermal={isThermal} />
      </Popover.Dropdown>
    </Popover>
  );
};

export default ControlMeansButton;
