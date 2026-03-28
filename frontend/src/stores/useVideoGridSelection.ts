import { create } from 'zustand';

type VideoGridSelectionState = {
  slotCameraIndexBySlot: Record<number, number>;
  isThermalBySlot: Record<number, boolean>;
  setSlotCameraIndex: (slot: number, cameraIndex: number) => void;
  toggleThermal: (slot: number) => void;
};

export const useVideoGridSelectionStore = create<VideoGridSelectionState>(
  (set) => ({
    slotCameraIndexBySlot: {},
    isThermalBySlot: {},
    setSlotCameraIndex: (slot, cameraIndex) =>
      set((state) => ({
        slotCameraIndexBySlot: {
          ...state.slotCameraIndexBySlot,
          [slot]: cameraIndex,
        },
        isThermalBySlot: {
          ...state.isThermalBySlot,
          [slot]: false,
        },
      })),
    toggleThermal: (slot) =>
      set((state) => ({
        isThermalBySlot: {
          ...state.isThermalBySlot,
          [slot]: !state.isThermalBySlot[slot],
        },
      })),
  }),
);
