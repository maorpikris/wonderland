import { ActionIcon, Popover } from '@mantine/core';
import { History } from 'lucide-react';
import { useState } from 'react';
import { ReplayModal } from '../../ReplayVideo/ReplayModal';
import MeansActionButton from './MeansActionButton';

type ReplayMeansButtonProps = {
  slotIndex: number;
  cameraId: string;
  onPopOverToggle: (opened: boolean) => void;
};

export const ReplayMeansButton = ({
  cameraId,
  onPopOverToggle,
}: ReplayMeansButtonProps) => {
  const [modalOpened, setModalOpened] = useState(false);

  const handleOpenModal = () => {
    setModalOpened(true);
    onPopOverToggle(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    onPopOverToggle(false);
  };

  return (
    <>
      <MeansActionButton onClick={handleOpenModal}>
        <History size={15} />
      </MeansActionButton>

      <ReplayModal
        cameraId={cameraId}
        opened={modalOpened}
        onClose={handleCloseModal}
      />
    </>
  );
};
