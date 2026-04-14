import {
  AppPage,
  useNavigationStore,
} from '../../../stores/useNavigationStore';
import { useHomeTopBarSlots } from './homeTopbar/HomeTopBarContent';
import type { TopbarSlots } from './TopbarShell';

export const useTopbarContent = (): TopbarSlots => {
  const currentPage = useNavigationStore((s) => s.currentPage);
  const homeSlots = useHomeTopBarSlots();

  const topbarComponentMap: Record<AppPage, TopbarSlots> = {
    [AppPage.HOME]: homeSlots,
  };

  return topbarComponentMap[currentPage] ?? {};
};
