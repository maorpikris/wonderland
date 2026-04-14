import { style } from '@vanilla-extract/css';
import { colors } from '../../../../../theme/tokens.css';

export const root = style({
  width: 225,
  height: 40,
  gap: 16,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 5,
  padding: 4,
  background: colors.neutralAlpha3,
});

export const segment = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  paddingInline: 12,
  height: 36,
  borderRadius: 8,
  color: colors.neutralAlpha11,
  cursor: 'pointer',
  transition: 'all 150ms ease',

  selectors: {
    '&[data-active="true"]': {
      color: colors.accent9,
    },
  },
});

export const label = style({
  fontSize: 16,
  fontWeight: 500,
  lineHeight: '20px',
});

export const divider = style({
  width: 1,
  height: 20,
  background: colors.border,
  marginInline: 4,
});
