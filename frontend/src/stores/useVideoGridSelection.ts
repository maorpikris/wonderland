import { create } from 'zustand';

type VideoGridSelectionState = {
  slotCameraIndexBySlot: Record<number, number>;
  setSlotCameraIndex: (slot: number, cameraIndex: number) => void;
};

export const useVideoGridSelectionStore = create<VideoGridSelectionState>(
  (set) => ({
    slotCameraIndexBySlot: {},
    setSlotCameraIndex: (slot, cameraIndex) =>
      set((state) => ({
        slotCameraIndexBySlot: {
          ...state.slotCameraIndexBySlot,
          [slot]: cameraIndex,
        },
      })),
  }),
);
