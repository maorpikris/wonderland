import { style } from '@vanilla-extract/css';
import { colors } from '../../../../../theme/tokens.css';

export const optionRoot = style({
  height: 22,
  gap: 10,
  display: 'flex',
  alignItems: 'center',
});

export const optionLabel = style({
  color: colors.accentContrast,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '18px',
});

export const radioRoot = style({
  display: 'flex',
  alignItems: 'center',
  margin: 0,
});

export const radio = style({
  width: 16,
  height: 16,
  borderRadius: '50%',
  border: `2px solid ${colors.border}`,
});

export const radioIcon = style({
  width: 6,
  height: 6,
});

export const trigger = style({
  height: 36,
  width: 110,
  justifyContent: 'center',
  paddingInline: 12,
  borderRadius: 5,
  border: `1.5px solid ${colors.border} !important`,
  background: `${colors.button} !important`,
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  gap: 8,

  selectors: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },
});

export const triggerText = style({
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '18px',
  letterSpacing: '1px',
  color: colors.neutralAlpha11,
});

export const chevron = style({
  transition: 'transform 150ms ease',
});

export const chevronOpen = style({
  transform: 'rotate(180deg)',
});

export const dropdown = style({
  width: 120,
  padding: 10,
  borderRadius: 16,
  border: `1.5px solid ${colors.border}`,
  backgroundColor: colors.background,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  direction: 'rtl',
});

export const dropdownHeader = style({
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '18px',
  textAlign: 'right',
  color: colors.neutralAlpha11,
});

export const optionsList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const tooltip = style({
  maxWidth: 115,
  padding: '8px 12px',
  lineHeight: '14px',
  textAlign: 'center',
});
