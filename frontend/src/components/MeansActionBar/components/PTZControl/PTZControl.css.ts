import { style } from '@vanilla-extract/css';
import { colors, radius, space, typography } from '@src/theme/tokens.css';

export const ptzStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 8px 8px 8px',
    background: colors.surface,
    borderRadius: radius.borderRadiusMax2,
    border: `1px solid ${colors.neutralAlpha3}`,
    width: 'fit-content',
    minWidth: '150px',
  }),

  grid: style({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '4px',
    justifyItems: 'center',
    alignItems: 'center',
  }),

  controlButton: style({
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.borderRadiusMax1,
    backgroundColor: colors.neutralAlpha3,
    color: colors.textPrimary,
    cursor: 'pointer',
    transition: 'background-color 100ms ease',
    ':hover': {
      backgroundColor: colors.neutralAlpha5,
    },
    ':active': {
      backgroundColor: colors.accent8,
      color: colors.accentContrast,
    },
  }),

  zoomContainer: style({
    display: 'flex',
    gap: '2px',
  }),

  focusContainer: style({
    display: 'flex',
    gap: '2px',
  }),

  extraControlsContainer: style({
    display: 'flex',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    marginTop: '8px',
    padding: '0 4px',
  }),

  extraGroup: style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  }),

  zoomButton: style({
    width: '38px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.borderRadiusMax1,
    backgroundColor: colors.neutralAlpha3,
    color: colors.textPrimary,
    cursor: 'pointer',
    fontSize: typography.fontSize1,
    fontWeight: typography.fontWeightMedium,
    transition: 'background-color 100ms ease',
    ':hover': {
      backgroundColor: colors.neutralAlpha5,
    },
    ':active': {
      backgroundColor: colors.accent8,
      color: colors.accentContrast,
    },
  }),

  focusButton: style({
    width: '38px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.borderRadiusMax1,
    backgroundColor: colors.neutralAlpha3,
    color: colors.textPrimary,
    cursor: 'pointer',
    fontSize: typography.fontSize1,
    fontWeight: typography.fontWeightMedium,
    transition: 'background-color 100ms ease',
    border: `1px dashed ${colors.neutralAlpha5}`,
    ':hover': {
      backgroundColor: colors.neutralAlpha5,
    },
    ':active': {
      backgroundColor: colors.accent8,
      color: colors.accentContrast,
    },
  }),

  groupTitle: style({
    fontSize: '10px',
    color: colors.textPrimary,
    opacity: 0.4,
    textTransform: 'uppercase',
    fontWeight: 700,
    letterSpacing: '0.05em',
  }),

  sensitivityContainer: style({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '4px',
    padding: `0 ${space.spacing1}`,
  }),

  sensitivityLabel: style({
    color: colors.textPrimary,
    fontSize: typography.fontSize1,
    fontWeight: typography.fontWeightMedium,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing1,
    opacity: 0.6,
  }),

  slider: {
    root: style({
      width: '100%',
    }),
    track: style({
      height: '4px',
      backgroundColor: colors.neutralAlpha3,
    }),
    bar: style({
      backgroundColor: colors.accent8,
    }),
    thumb: style({
      width: '12px',
      height: '12px',
      backgroundColor: colors.accent8,
      border: `2px solid ${colors.accentContrast}`,
      boxShadow: `0 0 10px ${colors.accent8}`,
      transition: 'box-shadow 150ms ease, border-color 150ms ease',
      ':hover': {
        boxShadow: `0 0 0 4px ${colors.accent8}33, 0 0 15px ${colors.accent8}`,
        cursor: 'grab',
      },
      ':active': {
        cursor: 'grabbing',
      },
    }),
  },
};
