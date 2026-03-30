import { Box, UnstyledButton } from '@mantine/core';
import { 
  CaretUp, 
  CaretDown, 
  CaretLeft, 
  CaretRight, 
  Plus, 
  Minus 
} from '@phosphor-icons/react';
import { useRef, useEffect } from 'react';
import { 
  moveUp, 
  moveDown, 
  rotateLeft, 
  rotateRight, 
  zoomIn, 
  zoomOut 
} from '@api/cameras.api';
import { ptzStyles } from './PTZControl.css';

type PTZControlProps = {
  cameraId: string;
  isThermal: boolean;
};

const PTZControl = ({ cameraId, isThermal }: PTZControlProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAction = (action: (id: string, isThermal?: boolean) => Promise<any>) => {
    // Initial call
    action(cameraId, isThermal);
    
    // Start interval
    intervalRef.current = setInterval(() => {
      action(cameraId, isThermal);
    }, 500);
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
    gridArea 
  }: { 
    icon: any, 
    action: (id: string, isThermal?: boolean) => Promise<any>, 
    gridArea?: string 
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
        <ControlButton icon={CaretRight} action={rotateRight} gridArea="2 / 1" />
        <ControlButton icon={CaretDown} action={moveDown} gridArea="3 / 2" />
      </Box>

      <Box className={ptzStyles.zoomContainer}>
        <UnstyledButton 
          className={ptzStyles.zoomButton}
          onMouseDown={() => startAction(zoomIn)}
          onMouseUp={stopAction}
          onMouseLeave={stopAction}
        >
          <Plus size={14} weight="bold" />
        </UnstyledButton>
        <UnstyledButton 
          className={ptzStyles.zoomButton}
          onMouseDown={() => startAction(zoomOut)}
          onMouseUp={stopAction}
          onMouseLeave={stopAction}
        >
          <Minus size={14} weight="bold" />
        </UnstyledButton>
      </Box>
    </Box>
  );
};

export default PTZControl;
