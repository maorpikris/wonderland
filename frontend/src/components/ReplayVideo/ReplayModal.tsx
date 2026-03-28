import {
  Modal,
  Stack,
  Group,
  Text,
  ScrollArea,
  Card,
  ActionIcon,
  Box,
  Center,
  Loader,
  Badge,
  Grid,
  SegmentedControl,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Calendar, Clock, Play, Download } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { axiosInstance } from '../../api/axios';

interface Recording {
  start: string;
  duration: number;
  url: string;
  quality?: 'high' | 'low';
  isThermal?: boolean;
}

type GroupedRecordings = Record<string, Recording[]>;

interface ReplayModalProps {
  cameraId: string;
  opened: boolean;
  onClose: () => void;
}

export const ReplayModal = ({
  cameraId,
  opened,
  onClose,
}: ReplayModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [recordings, setRecordings] = useState<GroupedRecordings>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeRecording, setActiveRecording] = useState<Recording | null>(
    null,
  );
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  const fetchRecordings = async (date: Date) => {
    setIsLoading(true);
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      const response = await axiosInstance.get(
        `/recordings/list?cameraId=${cameraId}&date=${formattedDate}`,
      );
      setRecordings(response.data);
    } catch (err) {
      console.error('Failed to fetch recordings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (opened && selectedDate) {
      fetchRecordings(selectedDate);
    }
  }, [opened, selectedDate, cameraId]);

  const filteredRecordings = useMemo(() => {
    const result: GroupedRecordings = {};
    Object.entries(recordings).forEach(([hour, segs]) => {
      const filtered = segs.filter((s) => {
        if (qualityFilter === 'all') return true;
        return s.quality === qualityFilter;
      });
      if (filtered.length > 0) {
        result[hour] = filtered;
      }
    });
    return result;
  }, [recordings, qualityFilter]);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (isoString: string) => {
    return dayjs(isoString).format('HH:mm:ss');
  };

  const formatHour = (isoString: string) => {
    return dayjs(isoString).format('HH:00');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" w="100%" pr="xl">
          <Group gap="xs">
            <Clock size={20} />
            <Text fw={700} size="lg">
              ארכיון הקלטות
            </Text>
          </Group>
          <SegmentedControl
            size="xs"
            value={qualityFilter}
            onChange={setQualityFilter}
            data={[
              { label: 'הכל', value: 'all' },
              { label: 'איכות גבוהה', value: 'high' },
              { label: 'איכות רגילה', value: 'low' },
            ]}
          />
        </Group>
      }
      size="80%"
      dir="rtl"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        title: { width: '100%' },
      }}
    >
      <Grid gutter="md">
        <Grid.Col span={4}>
          <Stack gap="md">
            <DatePickerInput
              label="בחר תאריך"
              placeholder="Pick a date"
              value={selectedDate}
              onChange={(val) => setSelectedDate(val as Date | null)}
              leftSection={<Calendar size={18} />}
              clearable={false}
              maxDate={new Date()}
            />

            <ScrollArea h={500} offsetScrollbars>
              {isLoading ? (
                <Center p="xl">
                  <Loader size="md" />
                </Center>
              ) : Object.keys(filteredRecordings).length === 0 ? (
                <Center p="xl">
                  <Text c="dimmed">אין הקלטות התואמות את הסינון</Text>
                </Center>
              ) : (
                <Stack gap="lg">
                  {Object.entries(filteredRecordings).map(
                    ([hour, hourSegments]) => (
                      <Box key={hour}>
                        <Group mb="xs" gap="xs">
                          <Badge variant="filled" size="lg" color="blue">
                            {formatHour(hour)}
                          </Badge>
                          <Text size="sm" c="dimmed">
                            {hourSegments.length} קטעים
                          </Text>
                        </Group>
                        <Stack gap="xs">
                          {hourSegments.map((seg, idx) => (
                            <Card
                              key={idx}
                              shadow="sm"
                              p="xs"
                              padding="xs"
                              radius="md"
                              withBorder
                              style={{
                                cursor: 'pointer',
                                backgroundColor:
                                  activeRecording?.url === seg.url
                                    ? 'var(--mantine-color-blue-light)'
                                    : undefined,
                              }}
                              onClick={() => setActiveRecording(seg)}
                            >
                              <Group justify="space-between" wrap="nowrap">
                                <Group gap="xs">
                                  <Play
                                    size={16}
                                    fill={
                                      activeRecording?.url === seg.url
                                        ? 'currentColor'
                                        : 'none'
                                    }
                                  />
                                  <Stack gap={0}>
                                    <Group gap={6}>
                                      <Text size="sm" fw={500}>
                                        {formatTime(seg.start)}
                                      </Text>
                                      {seg.quality === 'high' && (
                                        <Badge
                                          size="xs"
                                          color="orange"
                                          variant="light"
                                        >
                                          high res
                                        </Badge>
                                      )}
                                      <Badge
                                        size="xs"
                                        color={seg.isThermal ? 'grape' : 'yellow'}
                                        variant="filled"
                                      >
                                        {seg.isThermal ? 'תרמי' : 'יום'}
                                      </Badge>
                                    </Group>
                                    <Text size="xs" c="dimmed">
                                      משך: {formatDuration(seg.duration)}
                                    </Text>
                                  </Stack>
                                </Group>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(
                                      seg.url,
                                      `recording_${cameraId}_${dayjs(seg.start).format('YYYYMMDD_HHmmss')}.mp4`,
                                    );
                                  }}
                                >
                                  <Download size={16} />
                                </ActionIcon>
                              </Group>
                            </Card>
                          ))}
                        </Stack>
                      </Box>
                    ),
                  )}
                </Stack>
              )}
            </ScrollArea>
          </Stack>
        </Grid.Col>

        <Grid.Col span={8}>
          <Box
            h={600}
            bg="black"
            style={{
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {activeRecording ? (
              <>
                <video
                  key={activeRecording.url}
                  src={activeRecording.url}
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
                <Box
                  pos="absolute"
                  bottom={60}
                  left={20}
                  right={20}
                  style={{ pointerEvents: 'none' }}
                >
                  <Badge color="dark" variant="filled" opacity={0.7} size="lg">
                    {dayjs(activeRecording.start).format('DD/MM/YYYY HH:mm:ss')}{' '}
                    (
                    {activeRecording.isThermal ? 'Thermal' : 'Day'}
                    {' - '}
                    {activeRecording.quality === 'high'
                      ? 'High Res'
                      : 'Standard'}
                    )
                  </Badge>
                </Box>
              </>
            ) : (
              <Center h="100%">
                <Stack align="center" gap="xs">
                  <Play size={48} color="white" opacity={0.3} />
                  <Text c="dimmed" size="lg">
                    בחר קטע להצגה
                  </Text>
                </Stack>
              </Center>
            )}
          </Box>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};
