import { style } from '@vanilla-extract/css';
import { colors } from '../../theme/tokens.css';
import backgroundImage from '@assets/images/background.svg';

const pageGrid = style({
  width: '100%',
  height: '100%',
  display: 'grid',
  overflow: 'hidden',
});

export const mainPageStyles = {
  withLeftSidebar: `${pageGrid} ${style({
    gridTemplateColumns: '1fr 220px',
  })}`,

  withoutLeftSidebar: `${pageGrid} ${style({
    gridTemplateColumns: '1fr 0',
  })}`,

  leftSidebar: style({
    minWidth: 0,
    height: '100%',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  }),

  /** Right column: map / devices / mixed content */
  mainColumn: style({
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
  }),

  mapOnlyPane: style({
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  }),

  videoGridHost: style({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  }),

  devicesOnlyPane: style({
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: colors.background,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }),

  mixedGroup: style({
    width: '100%',
    height: '100%',
    minHeight: 0,
    backgroundColor: colors.background,
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }),

  mixedPanel: style({
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  }),

  mixedSeparator: style({
    width: 2.5,
    height: 120,
    flexShrink: 0,
    alignSelf: 'center',
    background: 'rgba(217, 237, 255, 0.25)',
    transform: 'translateX(-3.8px)',
  }),
};
