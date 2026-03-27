import {
  Box,
  Card,
  Badge,
  Text,
  Button,
  Group,
  Stack,
  ScrollArea,
} from '@mantine/core';
import { useCameras } from '@src/hooks/useCameras';
import { CameraEditModal } from '../../camera/CameraEditModal';
import { useState } from 'react';
import type { Camera } from '@src/types';

export function LeftSidebar() {
  const { data: cameras, isLoading } = useCameras();
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const handleEdit = (camera: Camera) => {
    setSelectedCamera(camera);
    setModalOpened(true);
  };

  return (
    <Box p="md" h="100%" dir="rtl">
      <Text size="xl" fw={700} mb="lg">
        מצלמות
      </Text>
      <ScrollArea h="calc(100vh - 120px)">
        <Stack gap="md">
          {isLoading && <Text>טוען מצלמות...</Text>}
          {cameras?.map((camera) => (
            <Card
              key={camera.id}
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
            >
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="md">
                  {camera.name}
                </Text>
                <Badge 
                  color={camera.availability === 'AVAILABLE' ? 'green' : 'red'} 
                  variant="light" 
                  size="sm"
                >
                  {camera.availability === 'AVAILABLE' ? 'זמין' : 'זמין בחלקיות / לא זמין'}
                </Badge>
              </Group>

              <Text size="xs" c="dimmed">
                ID: {camera.id}
              </Text>

              <Button
                variant="filled"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
                size="xs"
                onClick={() => handleEdit(camera)}
              >
                ערוך
              </Button>
            </Card>
          ))}
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
