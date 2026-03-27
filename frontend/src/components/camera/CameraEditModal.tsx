import { Modal, TextInput, NumberInput, Group, Button, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { MapPin } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import type { Camera } from '@src/types';
import { useUpdateCamera } from '@src/hooks/useCameras';
import { wgs84ToUtm, utmToWgs84 } from '@src/utils/utm';
import { useMapClickStore } from '@src/stores/useMapClick';

interface Props {
  camera: Camera | null;
  opened: boolean;
  onClose: () => void;
}

export function CameraEditModal({ camera, opened, onClose }: Props) {
  const [name, setName] = useState('');
  const [azimuth, setAzimuth] = useState<number | undefined>(0);
  const [easting, setEasting] = useState<number | undefined>(0);
  const [northing, setNorthing] = useState<number | undefined>(0);
  const [isHidden, setIsHidden] = useState(false);
  const updateCamera = useUpdateCamera();
  const setMapClickCallback = useMapClickStore((s) => s.setCallback);

  useEffect(() => {
    if (camera && opened) {
      setName(camera.name);
      setAzimuth(camera.initialAzimuth || 0);
      if (camera.position) {
        const utm = wgs84ToUtm(camera.position.coordinates[0], camera.position.coordinates[1]);
        setEasting(utm.easting);
        setNorthing(utm.northing);
      } else {
        setEasting(undefined);
        setNorthing(undefined);
      }
    }
  }, [camera?.id, opened]);

  useEffect(() => {
    if (!opened) {
      setIsHidden(false);
    }
  }, [opened]);

  const handleSave = () => {
    if (!camera) return;
    
    let position = camera.position;
    if (easting !== undefined && northing !== undefined) {
      const wgs = utmToWgs84(easting, northing);
      position = {
        type: 'Point',
        coordinates: [wgs.lon, wgs.lat],
      };
    }

    updateCamera.mutate({
      id: camera.id,
      data: {
        name,
        initialAzimuth: azimuth,
        position,
      },
    }, {
      onSuccess: onClose
    });
  };

  const handlePickFromMap = () => {
    setIsHidden(true);
    setMapClickCallback((lng, lat) => {
      const utm = wgs84ToUtm(lng, lat);
      setEasting(utm.easting);
      setNorthing(utm.northing);
      setIsHidden(false);
    });
  };

  return (
    <Modal opened={opened && !isHidden} onClose={onClose} title="עריכת מצלמה" centered size="md" dir="rtl">
      <Stack>
        <TextInput
          label="שם המצלמה"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <NumberInput
          label="אזימוט ראשוני"
          value={azimuth}
          onChange={(val) => setAzimuth(typeof val === 'number' ? val : 0)}
        />
        <Group align="flex-end">
          <NumberInput
            label="Easting (UTM)"
            value={easting}
            onChange={(val) => setEasting(typeof val === 'number' ? val : undefined)}
            style={{ flex: 1 }}
          />
          <NumberInput
            label="Northing (UTM)"
            value={northing}
            onChange={(val) => setNorthing(typeof val === 'number' ? val : undefined)}
            style={{ flex: 1 }}
          />
          <Tooltip label="בחר מהמפה">
            <ActionIcon size={36} variant="light" color="blue" onClick={handlePickFromMap}>
              <MapPin size={24} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} color="gray">ביטול</Button>
          <Button onClick={handleSave} loading={updateCamera.isPending}>שמירה</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
