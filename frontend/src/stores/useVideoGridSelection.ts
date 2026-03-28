import { create } from 'zustand';

type VideoGridSelectionState = {
  slotCameraIndexBySlot: Record<number, number>;
  replayTimeBySlot: Record<number, string | null>; // ISO string or null for live
  setSlotCameraIndex: (slot: number, cameraIndex: number) => void;
  setReplayTime: (slot: number, time: string | null) => void;
};

export const useVideoGridSelectionStore = create<VideoGridSelectionState>(
  (set) => ({
    slotCameraIndexBySlot: {},
    replayTimeBySlot: {},
    setSlotCameraIndex: (slot, cameraIndex) =>
      set((state) => ({
        slotCameraIndexBySlot: {
          ...state.slotCameraIndexBySlot,
          [slot]: cameraIndex,
        },
      })),
    setReplayTime: (slot, time) =>
      set((state) => ({
        replayTimeBySlot: {
          ...state.replayTimeBySlot,
          [slot]: time,
        },
      })),
  }),
);
