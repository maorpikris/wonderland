import { Group } from '@mantine/core';
import { DevicesGridDropdown } from './devicesGridDropdown/DevicesGridDropdown';
import { LeftSidebarToggle } from './leftSidebarToggle/LeftSidebarToggle';
import { LayoutToggle } from './layoutToggle/LayoutToggle';
import * as styles from './HomeTopBarContent.css';
import {
  MainPageLayoutOptions,
  useMainPageLayoutStore,
} from '../../../../stores/useMainPageLayout';
import type { TopbarSlots } from '../TopbarShell';

export function useHomeTopBarSlots(): TopbarSlots {
  const currentLayout = useMainPageLayoutStore((s) => s.currentLayout);

  const isMapLayout = currentLayout === MainPageLayoutOptions.MAP;

  return {
    center: (
      <Group className={styles.centerGroup}>
        <LayoutToggle />
      </Group>
    ),
    left: (
      <Group className={styles.leftGroup}>
        <DevicesGridDropdown disabled={isMapLayout} />
        <LeftSidebarToggle />
      </Group>
    ),
  };
}
