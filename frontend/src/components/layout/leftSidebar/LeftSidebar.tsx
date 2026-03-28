import {
  Box,
  Card,
  Badge,
  Text,
  Button,
  Stack,
  ScrollArea,
} from '@mantine/core';
import { useCameras } from '@src/hooks/useCameras';
import { CameraEditModal } from '../../camera/CameraEditModal';
import { useState } from 'react';
import type { Camera } from '@src/types';
import { leftSidebarStyles } from './LeftSidebar.css';
import { Cctv, Thermometer } from 'lucide-react';
import { colors } from '../../../theme/tokens.css';

export function LeftSidebar() {
  const { data: cameras, isLoading } = useCameras();
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const handleEdit = (camera: Camera) => {
    setSelectedCamera(camera);
    setModalOpened(true);
  };

  return (
    <Box className={leftSidebarStyles.root}>
      <ScrollArea
        className={leftSidebarStyles.scrollArea}
        scrollbars="y"
        type="hover"
      >
        <Stack gap="xs">
          {isLoading && (
            <Text c="dimmed" ta="center" mt="xl">
              טוען מצלמות...
            </Text>
          )}
          {!isLoading && cameras?.length === 0 && (
            <Text c="dimmed" ta="center" mt="xl">
              לא נמצאו מצלמות
            </Text>
          )}
          {cameras?.map((camera) => {
            const isDisconnected = camera.availability === 'UNAVAILABLE';
            return (
              <Card
                key={camera.id}
                className={leftSidebarStyles.card}
                onClick={isDisconnected ? undefined : () => handleEdit(camera)}
                style={{
                  opacity: isDisconnected ? 0.5 : 1,
                  pointerEvents: isDisconnected ? 'none' : 'auto',
                  cursor: isDisconnected ? 'not-allowed' : 'pointer',
                }}
              >
                <div className={leftSidebarStyles.cardHeader}>
                  <div style={{ flex: 1 }}>
                    <h3 className={leftSidebarStyles.cameraName}>
                      {camera.name}
                    </h3>
                    <div className={leftSidebarStyles.cameraId}>
                      ID: {camera.id}
                    </div>
                  </div>
                  <Cctv
                    size={18}
                    color={colors.accent9}
                    style={{ opacity: 0.7 }}
                  />
                </div>

                <div className={leftSidebarStyles.badgeContainer}>
                  {/* Availability Badge */}
                  <Badge
                    variant="filled"
                    color={camera.availability === 'AVAILABLE' ? 'teal' : 'red'}
                    className={leftSidebarStyles.badge}
                    size="xs"
                  >
                    {camera.availability === 'AVAILABLE' ? 'זמין' : 'מנותק'}
                  </Badge>

                  {/* Thermal Badge */}
                  {camera.hasThermal && (
                    <Badge
                      variant="light"
                      color="orange"
                      className={leftSidebarStyles.badge}
                      size="xs"
                      leftSection={<Thermometer size={10} />}
                    >
                      תרמית
                    </Badge>
                  )}
                </div>

                <Button
                  variant="subtle"
                  fullWidth
                  size="xs"
                  radius="md"
                  className={leftSidebarStyles.editButton}
                  disabled={isDisconnected}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(camera);
                  }}
                >
                  פרטים ועריכה
                </Button>
              </Card>
            );
          })}
        </Stack>
      </ScrollArea>

      <CameraEditModal
        camera={selectedCamera}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </Box>
  );
}
