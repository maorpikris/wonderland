import { ActionIcon, Popover, Stack, Button, Flex, TextInput } from '@mantine/core';
import { History, RotateCcw, RotateCw, Radio } from 'lucide-react';
import { useVideoGridSelectionStore } from '@stores/useVideoGridSelection';

type ReplayMeansButtonProps = {
  slotIndex: number;
  onPopOverToggle: (opened: boolean) => void;
};

export const ReplayMeansButton = ({
  slotIndex,
  onPopOverToggle,
}: ReplayMeansButtonProps) => {
  const replayTime = useVideoGridSelectionStore((s) => s.replayTimeBySlot[slotIndex]);
  const setReplayTime = useVideoGridSelectionStore((s) => s.setReplayTime);

  const handleRewind = (seconds: number) => {
    const baseTime = replayTime ? new Date(replayTime).getTime() : Date.now();
    const newTime = new Date(baseTime + seconds * 1000).toISOString();
    setReplayTime(slotIndex, newTime);
  };

  const handleJumpToTime = (date: Date | null) => {
    if (date) {
      setReplayTime(slotIndex, date.toISOString());
    }
  };

  const goLive = () => {
    setReplayTime(slotIndex, null);
  };

  return (
    <Popover
      width={300}
      position="top"
      withArrow
      shadow="md"
      onOpen={() => onPopOverToggle(true)}
      onClose={() => onPopOverToggle(false)}
    >
      <Popover.Target>
        <ActionIcon
          variant={replayTime ? "filled" : "light"}
          color={replayTime ? "blue" : "gray"}
          size="lg"
          title="Replay"
        >
          <History size={20} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p="md">
        <Stack gap="md">
          <Flex gap="sm" justify="center">
            <Button 
                variant="light" 
                leftSection={<RotateCcw size={16} />}
                onClick={() => handleRewind(-30)}
            >
              -30s
            </Button>
            <Button 
                variant="light" 
                rightSection={<RotateCw size={16} />}
                onClick={() => handleRewind(30)}
            >
              +30s
            </Button>
          </Flex>

          <TextInput
            label="בחירת זמן (Jump to Time)"
            type="datetime-local"
            value={replayTime ? new Date(new Date(replayTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                    handleJumpToTime(date);
                }
            }}
          />

          <Button 
            variant="filled" 
            color="red" 
            fullWidth 
            leftSection={<Radio size={16} />}
            onClick={goLive}
          >
            חזרה לשידור חי (Back to Live)
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
