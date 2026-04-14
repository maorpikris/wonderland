import { MainPage } from '../../../pages/mainPage/MainPage';
import {
  AppPage,
  useNavigationStore,
} from '../../../stores/useNavigationStore';

const pageComponentMap: Record<AppPage, React.ReactNode> = {
  [AppPage.HOME]: <MainPage />,
};

export const MainContentSwitcher = () => {
  const currentPage = useNavigationStore((s) => s.currentPage);

  return pageComponentMap[currentPage] ?? null;
};
