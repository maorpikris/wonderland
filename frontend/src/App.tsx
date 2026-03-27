import { AppShell } from '@mantine/core';
import { appShellStyles } from './App.css';
import { layout } from './theme/tokens.css';
import { RightSidebar } from './components/layout/rightSidebar/RightSidebar';
import { MainContentSwitcher } from './components/layout/main/MainContentSwitcher';
import { TopbarShell } from './components/layout/topbar/TopbarShell';
import { useTopbarContent } from './components/layout/topbar/TopbarContentSwitcher';

export default function App() {
  const { left, center, right } = useTopbarContent();

  return (
    <AppShell
      dir="rtl"
      header={{ height: layout.topbarHeight }}
      classNames={{
        header: appShellStyles.header,
        navbar: appShellStyles.navbar,
        main: appShellStyles.main,
      }}
    >
      <AppShell.Header>
        <TopbarShell left={left} center={center} right={right} />
      </AppShell.Header>

      <AppShell.Main>
        <MainContentSwitcher />
      </AppShell.Main>
    </AppShell>
  );
}
