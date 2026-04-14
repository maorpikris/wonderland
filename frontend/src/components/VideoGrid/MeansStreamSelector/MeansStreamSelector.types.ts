import type { Camera } from '@src/types';

export interface MeansStreamSelectorProps {
  cameras: Camera[];
  onSelect: (index: number) => void;
}
