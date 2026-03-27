import { create } from 'zustand';

export const MainPageLayoutOptions = {
  MAP: 'map',
  DEVICES: 'devices',
  MIXED: 'mixed',
} as const;

export type MainPageLayoutOptions =
  (typeof MainPageLayoutOptions)[keyof typeof MainPageLayoutOptions];

export type DevicesAmount = 1 | 2 | 3;

const GRID_COUNT_STORAGE_KEY = 'devices_grid_amount';

const isValidDevicesAmount = (value: unknown): value is DevicesAmount => {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 9
  );
};

const getInitialDevicesAmount = (): DevicesAmount => {
  const storedValue = localStorage.getItem(GRID_COUNT_STORAGE_KEY);
  if (!storedValue) return 3;

  const parsed = Number(storedValue);

  return isValidDevicesAmount(parsed) ? parsed : 3;
};

type MainPageLayoutStore = {
  currentLayout: MainPageLayoutOptions;
  isLeftSidebarOpen: boolean;
  devicesAmount: DevicesAmount;
  setCurrentLayout: (layout: MainPageLayoutOptions) => void;
  toggleMap: () => void;
  toggleDevices: () => void;
  toggleLeftSidebar: () => void;
  setLeftSidebarOpen: (isOpen: boolean) => void;
  setDevicesAmount: (devicesAmount: DevicesAmount) => void;
};

export const useMainPageLayoutStore = create<MainPageLayoutStore>((set) => ({
  currentLayout: MainPageLayoutOptions.MIXED,
  isLeftSidebarOpen: false,
  devicesAmount: getInitialDevicesAmount(),

  setCurrentLayout: (layout) => set({ currentLayout: layout }),

  toggleMap: () =>
    set((state) => {
      switch (state.currentLayout) {
        case MainPageLayoutOptions.DEVICES:
          return { currentLayout: MainPageLayoutOptions.MIXED };

        case MainPageLayoutOptions.MIXED:
          return { currentLayout: MainPageLayoutOptions.DEVICES };

        case MainPageLayoutOptions.MAP:
        default:
          return state;
      }
    }),

  toggleDevices: () =>
    set((state) => {
      switch (state.currentLayout) {
        case MainPageLayoutOptions.MAP:
          return { currentLayout: MainPageLayoutOptions.MIXED };

        case MainPageLayoutOptions.MIXED:
          return { currentLayout: MainPageLayoutOptions.MAP };

        case MainPageLayoutOptions.DEVICES:
        default:
          return state;
      }
    }),

  toggleLeftSidebar: () =>
    set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),

  setLeftSidebarOpen: (isOpen) => set({ isLeftSidebarOpen: isOpen }),

  setDevicesAmount: (devicesAmount) => {
    localStorage.setItem(GRID_COUNT_STORAGE_KEY, String(devicesAmount));
    set({ devicesAmount: devicesAmount });
  },
}));
