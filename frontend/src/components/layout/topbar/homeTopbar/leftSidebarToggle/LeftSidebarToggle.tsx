import { UnstyledButton } from '@mantine/core';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import * as styles from './LeftSidebarToggle.css.ts';
import { useMainPageLayoutStore } from '../../../../../stores/useMainPageLayout';

export function LeftSidebarToggle() {
  const isLeftSidebarOpen = useMainPageLayoutStore((s) => s.isLeftSidebarOpen);
  const toggleLeftSidebar = useMainPageLayoutStore((s) => s.toggleLeftSidebar);

  const Icon = isLeftSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <UnstyledButton
      type="button"
      onClick={toggleLeftSidebar}
      className={styles.root}
      data-open={isLeftSidebarOpen ? 'true' : undefined}
      aria-label={
        isLeftSidebarOpen ? 'Close left sidebar' : 'Open left sidebar'
      }
    >
      <Icon size={18} className={styles.icon} />
    </UnstyledButton>
  );
}
