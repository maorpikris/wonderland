import { useEffect } from 'react';
import MapView from '../../components/Map/MapView';
import VideoGrid from '../../components/VideoGrid/VideoGrid';
import { Group, Panel, Separator } from 'react-resizable-panels';
import {
  MainPageLayoutOptions,
  useMainPageLayoutStore,
} from '../../stores/useMainPageLayout';
import { useMapToolsStore } from '../../stores/useMapTools';
import { mainPageStyles } from './MainPage.css';
import { LeftSidebar } from '../../components/layout/leftSidebar/LeftSidebar';

export const MainPage = () => {
  const currentLayout = useMainPageLayoutStore((s) => s.currentLayout);
  const isLeftSidebarOpen = useMainPageLayoutStore((s) => s.isLeftSidebarOpen);
  const devicesAmount = useMainPageLayoutStore((s) => s.devicesAmount);
  const isMapOnlyLayout = currentLayout === MainPageLayoutOptions.MAP;
  const isMixedLayout = currentLayout === MainPageLayoutOptions.MIXED;

  useEffect(() => {
    if (currentLayout === MainPageLayoutOptions.DEVICES) {
      useMapToolsStore.getState().closeTools();
    }
  }, [currentLayout]);

  useEffect(() => {
    return () => {
      useMapToolsStore.getState().closeTools();
    };
  }, []);

  const outerLayoutClass = isLeftSidebarOpen
    ? mainPageStyles.withLeftSidebar
    : mainPageStyles.withoutLeftSidebar;

  return (
    <div className={outerLayoutClass} dir="rtl">
      <div className={mainPageStyles.mainColumn}>
        {isMapOnlyLayout && (
          <div className={mainPageStyles.mapOnlyPane}>
            <MapView />
          </div>
        )}

        {!isMapOnlyLayout && (
          <Group className={mainPageStyles.mixedGroup} orientation="horizontal">
            {isMixedLayout ? (
              <Panel className={mainPageStyles.mixedPanel} defaultSize="33%">
                <MapView />
              </Panel>
            ) : null}

            {isMixedLayout ? (
              <Separator className={mainPageStyles.mixedSeparator} />
            ) : null}

            <Panel
              className={mainPageStyles.mixedPanel}
              minSize="33%"
              maxSize="66%"
            >
              <div className={mainPageStyles.videoGridHost}>
                <VideoGrid count={devicesAmount} />
              </div>
            </Panel>
          </Group>
        )}
      </div>

      <div className={mainPageStyles.leftSidebar}>
        <LeftSidebar />
      </div>
    </div>
  );
};
