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
};
