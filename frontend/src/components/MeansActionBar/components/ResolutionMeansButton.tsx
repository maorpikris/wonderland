import { Menu } from '@mantine/core';
import { useState } from 'react';
import { Settings2, Check } from 'lucide-react';
import { useVideoGridSelectionStore } from '@stores/useVideoGridSelection';
import MeansActionButton from './MeansActionButton';

type ResolutionMeansButtonProps = {
  slotIndex: number;
  onPopOverToggle: (opened: boolean) => void;
};

const ResolutionMeansButton = ({
  slotIndex,
  onPopOverToggle,
}: ResolutionMeansButtonProps) => {
  const [opened, setOpened] = useState(false);
  const isLowResBySlot = useVideoGridSelectionStore((s) => s.isLowResBySlot);
  const setResolution = useVideoGridSelectionStore((s) => s.setResolution);

  const isLowRes = isLowResBySlot[slotIndex] ?? (slotIndex !== 0);

  const handleOpen = () => {
    setOpened(true);
    onPopOverToggle(true);
  };

  const handleClose = () => {
    setOpened(false);
    onPopOverToggle(false);
  };

  return (
    <Menu
      shadow="md"
      width={200}
      position="top-start"
      offset={10}
      onOpen={handleOpen}
      onClose={handleClose}
      withinPortal={false}
    >
      <Menu.Target>
        <div>
          <MeansActionButton>
            <Settings2 size={15} color={opened ? '#3b82f6' : 'currentColor'} />
          </MeansActionButton>
        </div>
      </Menu.Target>

      <Menu.Dropdown
        style={{
          backgroundColor: '#111827',
          border: '1px solid #334155',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }}
      >
        <Menu.Label
          style={{
            color: '#94A3B8',
            fontWeight: 700,
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            paddingBottom: '4px',
          }}
        >
          רזולוציה
        </Menu.Label>
        <Menu.Item
          onClick={() => setResolution(slotIndex, false)}
          rightSection={
            !isLowRes ? <Check size={14} color="#3b82f6" strokeWidth={3} /> : null
          }
          style={{
            color: !isLowRes ? '#3b82f6' : '#F1F5F9',
            fontSize: '14px',
            fontWeight: !isLowRes ? 600 : 400,
            padding: '8px 12px',
          }}
        >
          איכות גבוהה
        </Menu.Item>
        <Menu.Item
          onClick={() => setResolution(slotIndex, true)}
          rightSection={
            isLowRes ? <Check size={14} color="#3b82f6" strokeWidth={3} /> : null
          }
          style={{
            color: isLowRes ? '#3b82f6' : '#F1F5F9',
            fontSize: '14px',
            fontWeight: isLowRes ? 600 : 400,
            padding: '8px 12px',
          }}
        >
          איכות נמוכה
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ResolutionMeansButton;
