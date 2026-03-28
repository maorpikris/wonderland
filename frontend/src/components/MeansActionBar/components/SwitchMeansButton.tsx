import { Box, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { SwitchCameraIcon } from 'lucide-react';
import { useState } from 'react';
import { useCameras } from '@hooks/useCameras';
import { useVideoGridSelectionStore } from '@stores/useVideoGridSelection';
import {
  filterCamerasBySearch,
  StreamPickerDropdown,
} from '@components/VideoGrid/MeansStreamSelector/MeansStreamSelector';
import { meansStreamSelectorStyles } from '@components/VideoGrid/MeansStreamSelector/MeansStreamSelector.css';
import MeansActionButton from './MeansActionButton';

type SwitchMeansButtonProps = {
  slotIndex: number;
  onPopOverToggle: (opened: boolean) => void;
};

const SwitchMeansButton = ({
  slotIndex,
  onPopOverToggle,
}: SwitchMeansButtonProps) => {
  const [opened, { close, toggle }] = useDisclosure(false, {
    onOpen: () => onPopOverToggle(true),
    onClose: () => onPopOverToggle(false),
  });
  const [search, setSearch] = useState('');

  const { data: cameras } = useCameras();
  const setSlotCameraIndex = useVideoGridSelectionStore(
    (s) => s.setSlotCameraIndex,
  );

  const safeCameras = cameras ?? [];
  const filteredCameras = filterCamerasBySearch(safeCameras, search);

  const handlePick = (id: string) => {
    const index = safeCameras.findIndex((c) => c.id === id);
    if (index !== -1) {
      setSlotCameraIndex(slotIndex, index);
    }
    close();
    setSearch('');
  };

  return (
    <Popover
      opened={opened}
      onClose={close}
      position="top"
      offset={10}
      shadow="md"
      withinPortal={false}
      styles={{
        dropdown: {
          padding: 0,
          border: 'none',
          backgroundColor: 'transparent',
          width: '240px',
          zIndex: 1000,
        },
      }}
    >
      <Popover.Target>
        <div style={{ display: 'inline-block' }}>
          <MeansActionButton onClick={toggle}>
            <SwitchCameraIcon size={15} />
          </MeansActionButton>
        </div>
      </Popover.Target>

      <Popover.Dropdown>
        <Box
          style={{
            width: '240px',
            position: 'relative',
          }}
        >
          <StreamPickerDropdown
            search={search}
            onSearchChange={setSearch}
            options={filteredCameras}
            onPick={handlePick}
            className={meansStreamSelectorStyles.customDropdown}
            style={{
              position: 'static',
              marginTop: 0,
              width: '100%',
            }}
          />
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};

export default SwitchMeansButton;
