import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  ColorInput,
  Button,
  Group,
  Stack,
} from '@mantine/core';
import {
  useCreateSpot,
  useUpdateSpot,
  useDeleteSpot,
  useSpots,
} from '../../hooks/useSpots';
import type { Spot } from '../../types/spot.types';

interface SpotModalProps {
  opened: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  lngLat?: { lng: number; lat: number };
  spotId?: number;
}

const PRESET_COLORS = [
  '#228be6',
  '#40c057',
  '#fa5252',
  '#fab005',
  '#7950f2',
  '#e64980',
  '#fd7e14',
];

export const SpotModal = ({
  opened,
  onClose,
  mode,
  lngLat,
  spotId,
}: SpotModalProps) => {
  const { data: spots } = useSpots();
  const createSpot = useCreateSpot();
  const updateSpot = useUpdateSpot();
  const deleteSpot = useDeleteSpot();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#228be6');

  useEffect(() => {
    if (mode === 'edit' && spotId && spots) {
      const spot = spots.find((s) => s.id === spotId);
      if (spot) {
        setName(spot.name);
        setColor(spot.color);
      }
    } else if (mode === 'create') {
      setName('');
      setColor('#228be6');
    }
  }, [mode, spotId, spots, opened]);

  const handleSave = async () => {
    if (mode === 'create' && lngLat) {
      await createSpot.mutateAsync({
        name,
        color,
        position: { type: 'Point', coordinates: [lngLat.lng, lngLat.lat] },
      });
    } else if (mode === 'edit' && spotId) {
      await updateSpot.mutateAsync({
        id: spotId,
        data: { name, color },
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (spotId) {
      await deleteSpot.mutateAsync(spotId);
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'create' ? 'דקור איתור' : 'עריכת איתור'}
      centered
    >
      <Stack>
        <TextInput
          label="שם האיתור"
          placeholder="הכנס שם..."
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          autoFocus
        />
        <ColorInput
          label="צבע"
          placeholder="בחר צבע..."
          value={color}
          onChange={setColor}
          swatches={PRESET_COLORS}
        />
        <Group justify="space-between" mt="md">
          {mode === 'edit' && (
            <Button
              variant="outline"
              color="red"
              onClick={handleDelete}
              loading={deleteSpot.isPending}
            >
              מחק איתור
            </Button>
          )}
          <Group ml="auto">
            <Button variant="subtle" onClick={onClose}>
              ביטול
            </Button>
            <Button
              onClick={handleSave}
              loading={createSpot.isPending || updateSpot.isPending}
              disabled={!name}
            >
              {mode === 'create' ? 'הוסף איתור' : 'עדכן איתור'}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
