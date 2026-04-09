import { style } from '@vanilla-extract/css';
import { colors, radius, space, typography } from '@src/theme/tokens.css';

export const ptzStyles = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: space.spacing2,
    padding: space.spacing2,
    background: colors.surface,
    borderRadius: radius.borderRadiusMax2,
    border: `1px solid ${colors.neutralAlpha3}`,
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
    width: '32px',
    height: '32px',
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
    gap: space.spacing1,
    marginTop: space.spacing1,
  }),

  zoomButton: style({
    width: '48px',
    height: '28px',
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
  
  sensitivityContainer: style({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: space.spacing1,
    marginTop: space.spacing2,
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
      transition: 'transform 100ms ease',
      ':hover': {
        transform: 'scale(1.2)',
      },
    }),
  },
};
