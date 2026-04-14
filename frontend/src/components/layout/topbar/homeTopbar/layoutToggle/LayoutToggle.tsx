import { UnstyledButton } from '@mantine/core';
import { Map, Video } from 'lucide-react';
import * as styles from './LayoutToggle.css';
import {
  MainPageLayoutOptions,
  useMainPageLayoutStore,
} from '../../../../../stores/useMainPageLayout';

export function LayoutToggle() {
  const currentLayout = useMainPageLayoutStore((s) => s.currentLayout);
  const toggleDevices = useMainPageLayoutStore((s) => s.toggleDevices);
  const toggleMap = useMainPageLayoutStore((s) => s.toggleMap);

  const isDevices = currentLayout !== MainPageLayoutOptions.MAP;
  const isMap = currentLayout !== MainPageLayoutOptions.DEVICES;

  return (
    <div className={styles.root}>
      <UnstyledButton
        onClick={toggleMap}
        className={styles.segment}
        data-active={isMap ? 'true' : undefined}
      >
        <Map size={18} />
        <span className={styles.label}>מפה</span>
      </UnstyledButton>

      <div className={styles.divider} />

      <UnstyledButton
        onClick={toggleDevices}
        className={styles.segment}
        data-active={isDevices ? 'true' : undefined}
      >
        <Video size={18} />
        <span className={styles.label}>אמצעים</span>
      </UnstyledButton>
    </div>
  );
}
