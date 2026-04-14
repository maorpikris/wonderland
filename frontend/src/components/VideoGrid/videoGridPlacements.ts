import type { CSSProperties } from 'react';
import type { VideoCount } from './VideoGrid.types';

type CellPlacement = Pick<CSSProperties, 'gridColumn' | 'gridRow'>;

/**
 * Per-cell placement where the layout is not plain row-major auto placement.
 *
 * @warning Tightly coupled to the grid templates defined in `VideoGrid.css.ts`.
 * Changing the `gridTemplateColumns` or `gridTemplateRows` in the CSS file
 * could silently break these placements. Ensure both files are updated together.
 */
export const videoGridCellPlacement: {
  [K in VideoCount]: readonly CellPlacement[] | null;
} = {
  1: null,
  2: null,
  3: [
    { gridColumn: '1 / span 2', gridRow: '1' },
    { gridColumn: '1', gridRow: '2' },
    { gridColumn: '2', gridRow: '2' },
  ],
};
