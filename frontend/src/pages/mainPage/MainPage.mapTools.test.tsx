import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '@src/test/renderWithProviders';
import {
  useMainPageLayoutStore,
  MainPageLayoutOptions,
} from '@src/stores/useMainPageLayout';
import { useMapToolsStore } from '@src/stores/useMapTools';
import { MainPage } from './MainPage';

type MockMapInstance = {
  resize: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
};

const { mapInstances } = vi.hoisted(() => ({
  mapInstances: [] as MockMapInstance[],
}));

vi.mock('maplibre-gl', () => {
  class MockMap {
    resize = vi.fn();
    remove = vi.fn();

    constructor() {
      mapInstances.push(this);
    }
  }

  return {
    default: { Map: MockMap },
    Map: MockMap,
  };
});

vi.mock('@hooks/useCameras', () => ({
  useCameras: () => ({
    data: [],
  }),
}));

describe('MainPage map tools integration', () => {
  beforeEach(() => {
    mapInstances.length = 0;
    useMapToolsStore.setState({
      isOpen: false,
      selectedTool: null,
    });
    useMainPageLayoutStore.setState({
      currentLayout: MainPageLayoutOptions.MIXED,
      isLeftSidebarOpen: false,
    });
  });

  test('map-only layout renders the toggle, opens the tray, and removes the map on unmount', async () => {
    const user = userEvent.setup();

    useMainPageLayoutStore.setState({
      currentLayout: MainPageLayoutOptions.MAP,
    });

    const view = renderWithProviders(<MainPage />);

    expect(mapInstances).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'כלי מפה' }));

    const toolbar = screen.getByRole('toolbar', { name: 'בחירת כלי מפה' });

    expect(toolbar).toBeInTheDocument();
    expect(toolbar.parentElement).toHaveAttribute(
      'data-tray-placement',
      'center',
    );
    expect(screen.getByRole('button', { name: 'נקודה' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'קו' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'פוליגון' })).toBeInTheDocument();

    const mapInstance = mapInstances[0];

    view.unmount();

    expect(mapInstance.remove).toHaveBeenCalledTimes(1);
    expect(useMapToolsStore.getState()).toMatchObject({
      isOpen: false,
    });
  });

  test('mixed layout centers the tray inside the map pane when opened', async () => {
    const user = userEvent.setup();

    useMainPageLayoutStore.setState({
      currentLayout: MainPageLayoutOptions.MIXED,
    });

    renderWithProviders(<MainPage />);

    await user.click(screen.getByRole('button', { name: 'כלי מפה' }));

    const toolbar = screen.getByRole('toolbar', { name: 'בחירת כלי מפה' });

    expect(toolbar).toBeInTheDocument();
    expect(toolbar.parentElement).toHaveAttribute(
      'data-tray-placement',
      'center',
    );
  });

  test('switching between mixed and map-only layouts keeps the tray open and preserves the selected tool', async () => {
    const user = userEvent.setup();

    useMainPageLayoutStore.setState({
      currentLayout: MainPageLayoutOptions.MIXED,
    });

    renderWithProviders(<MainPage />);

    await user.click(screen.getByRole('button', { name: 'כלי מפה' }));
    await user.click(screen.getByRole('button', { name: 'פוליגון' }));

    act(() => {
      useMainPageLayoutStore.setState({
        currentLayout: MainPageLayoutOptions.MAP,
      });
    });

    expect(screen.getByRole('button', { name: 'כלי מפה' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(
      screen.getByRole('toolbar', { name: 'בחירת כלי מפה' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'פוליגון' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    act(() => {
      useMainPageLayoutStore.setState({
        currentLayout: MainPageLayoutOptions.MIXED,
      });
    });

    expect(screen.getByRole('button', { name: 'כלי מפה' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(
      screen.getByRole('toolbar', { name: 'בחירת כלי מפה' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'פוליגון' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('switching to device-only layout closes the tray but keeps the last selected tool', async () => {
    useMainPageLayoutStore.setState({
      currentLayout: MainPageLayoutOptions.MAP,
    });

    renderWithProviders(<MainPage />);

    fireEvent.click(screen.getByRole('button', { name: 'כלי מפה' }));
    fireEvent.click(screen.getByRole('button', { name: 'פוליגון' }));

    act(() => {
      useMainPageLayoutStore.setState({
        currentLayout: MainPageLayoutOptions.DEVICES,
      });
    });

    expect(
      screen.queryByRole('button', { name: 'כלי מפה' }),
    ).not.toBeInTheDocument();

    act(() => {
      useMainPageLayoutStore.setState({
        currentLayout: MainPageLayoutOptions.MAP,
      });
    });

    const remountedToggle = screen.getByRole('button', { name: 'כלי מפה' });

    expect(remountedToggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('toolbar', { name: 'בחירת כלי מפה' }),
    ).not.toBeInTheDocument();

    fireEvent.click(remountedToggle);

    expect(screen.getByRole('button', { name: 'פוליגון' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
