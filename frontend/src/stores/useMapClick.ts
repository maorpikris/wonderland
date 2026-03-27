import { create } from 'zustand';

type MapClickCallback = (lng: number, lat: number) => void;

type MapClickState = {
  callback: MapClickCallback | null;
  setCallback: (callback: MapClickCallback | null) => void;
  triggerCallback: (lng: number, lat: number) => void;
};

export const useMapClickStore = create<MapClickState>((set, get) => ({
  callback: null,
  setCallback: (callback) => set({ callback }),
  triggerCallback: (lng, lat) => {
    const { callback } = get();
    if (callback) {
      callback(lng, lat);
      set({ callback: null }); // Clear after use
    }
  },
}));
