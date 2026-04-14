import { Box, UnstyledButton, Slider, Text } from '@mantine/core';
import {
  CaretUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  Plus,
  Minus,
} from '@phosphor-icons/react';
import { useRef, useEffect, useState } from 'react';
import {
  moveUp,
  moveDown,
  rotateLeft,
  rotateRight,
  zoomIn,
  zoomOut,
  focusIn,
  focusOut,
} from '@api/cameras.api';
import { ptzStyles } from './PTZControl.css';

type PTZControlProps = {
  cameraId: string;
  isThermal: boolean;
};

const PTZControl = ({ cameraId, isThermal }: PTZControlProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [sensitivity, setSensitivity] = useState(5);

  const startAction = (
    action: (
      id: string,
      isThermal?: boolean,
      sensitivity?: number,
    ) => Promise<any>,
  ) => {
    // Only apply sensitivity to pan/tilt actions, not zoom or focus
    const isSpecialAction =
      action === zoomIn ||
      action === zoomOut ||
      action === focusIn ||
      action === focusOut;
    const s = isSpecialAction ? undefined : sensitivity / 10;

    // Initial call
    action(cameraId, isThermal, s);

    // Start interval
    intervalRef.current = setInterval(() => {
      action(cameraId, isThermal, s);
    }, 200);
  };

  const stopAction = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const ControlButton = ({
    icon: Icon,
    action,
    gridArea,
  }: {
    icon: any;
    action: (
      id: string,
      isThermal?: boolean,
      sensitivity?: number,
    ) => Promise<any>;
    gridArea?: string;
  }) => (
    <UnstyledButton
      className={ptzStyles.controlButton}
      style={{ gridArea }}
      onMouseDown={() => startAction(action)}
      onMouseUp={stopAction}
      onMouseLeave={stopAction}
    >
      <Icon size={18} weight="bold" />
    </UnstyledButton>
  );

  return (
    <Box className={ptzStyles.container}>
      <Box className={ptzStyles.grid}>
        <ControlButton icon={CaretUp} action={moveUp} gridArea="1 / 2" />
        <ControlButton icon={CaretLeft} action={rotateLeft} gridArea="2 / 3" />
        <ControlButton
          icon={CaretRight}
          action={rotateRight}
          gridArea="2 / 1"
        />
        <ControlButton icon={CaretDown} action={moveDown} gridArea="3 / 2" />
      </Box>

      <Box className={ptzStyles.extraControlsContainer}>
        <Box className={ptzStyles.extraGroup}>
          <Text className={ptzStyles.groupTitle}>זום</Text>
          <Box className={ptzStyles.zoomContainer}>
            <UnstyledButton
              className={ptzStyles.zoomButton}
              onMouseDown={() => startAction(zoomIn)}
              onMouseUp={stopAction}
              onMouseLeave={stopAction}
            >
              <Plus size={12} weight="bold" />
            </UnstyledButton>
            <UnstyledButton
              className={ptzStyles.zoomButton}
              onMouseDown={() => startAction(zoomOut)}
              onMouseUp={stopAction}
              onMouseLeave={stopAction}
            >
              <Minus size={12} weight="bold" />
            </UnstyledButton>
          </Box>
        </Box>

        <Box className={ptzStyles.extraGroup}>
          <Text className={ptzStyles.groupTitle}>פוקוס</Text>
          <Box className={ptzStyles.focusContainer}>
            <UnstyledButton
              className={ptzStyles.focusButton}
              onMouseDown={() => startAction(focusIn)}
              onMouseUp={stopAction}
              onMouseLeave={stopAction}
            >
              <Plus size={10} weight="bold" />
            </UnstyledButton>
            <UnstyledButton
              className={ptzStyles.focusButton}
              onMouseDown={() => startAction(focusOut)}
              onMouseUp={stopAction}
              onMouseLeave={stopAction}
            >
              <Minus size={10} weight="bold" />
            </UnstyledButton>
          </Box>
        </Box>
      </Box>

      <Box className={ptzStyles.sensitivityContainer}>
        <Text className={ptzStyles.sensitivityLabel}>
          מהירות: {sensitivity}
        </Text>
        <Slider
          value={sensitivity}
          onChange={setSensitivity}
          min={1}
          max={10}
          step={1}
          label={null}
          classNames={ptzStyles.slider}
        />
      </Box>
    </Box>
  );
};

export default PTZControl;
