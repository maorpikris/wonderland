import { keyframes, style, styleVariants } from '@vanilla-extract/css';
import { radius, space, typography } from '@src/theme/tokens.css';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const gridItem = style({
  minWidth: 0,
  minHeight: 0,
  width: '100%',
  height: '100%',
});

export const gridItemVideoHost = style({
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  overflow: 'hidden',
  border: '2px solid var(--Colors-Neutral-Neutral-5, #475569)',
  borderRadius: 'clamp(4px, 1.2vmin, 8px)',
});

export const gridItemWithVideo = style([gridItem, gridItemVideoHost]);

export const videoHost = style({
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
});

export const streamLoadingOverlay = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
});

export const streamLoadingSpinner = style({
  width: '40px',
  height: '40px',
  color: 'rgba(241, 247, 254, 0.71)',
  animation: `${spin} 1s linear infinite`,
  flexShrink: 0,
});

export const streamErrorIcon = style({
  width: '56px',
  height: '56px',
  color: 'rgba(241, 247, 254, 0.71)',
  flexShrink: 0,
});

export const streamErrorText = style({
  color: 'rgba(241, 247, 254, 0.71)',
  fontFamily: typography.fontFamilyText,
  fontSize: typography.fontSize1,
  fontWeight: 600,
  lineHeight: typography.lineHeight1,
  letterSpacing: typography.letterSpacing1,
  textAlign: 'center',
});

export const streamErrorGroup = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: space.spacing1,
});

export const streamErrorButton = style({
  display: 'inline-flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  gap: space.spacing1,
  height: space.buttonHeight1,
  padding: `0 ${space.spacing2}`,
  borderRadius: radius.borderRadiusMax1,
  backgroundColor: '#FB2C36',
  border: 'none',
  color: '#FFFFFF',
  fontFamily: typography.fontFamilyText,
  fontSize: typography.fontSize1,
  fontWeight: typography.fontWeightMedium,
  lineHeight: typography.lineHeight1,
  letterSpacing: typography.letterSpacing1,
  cursor: 'pointer',
});

export const streamLoadingLabel = style({
  height: space.buttonHeight1,
  padding: `0 ${space.spacing2}`,
  borderRadius: radius.borderRadiusMax1,
  backgroundColor: 'rgba(47, 98, 255, 0.24)',
  display: 'inline-flex',
  alignItems: 'center',
  color: '#9EB1FF',
  fontFamily: typography.fontFamilyText,
  fontSize: typography.fontSize1,
  fontWeight: typography.fontWeightMedium,
  lineHeight: typography.lineHeight1,
  letterSpacing: typography.letterSpacing1,
});

const gridBase = style({
  display: 'grid',
  flex: 1,
  minHeight: 0,
  width: '100%',
  height: '100%',
  padding: '8px',
  gap: '8px',
});

/** 2×2 tracks; count 3 overrides cell placement in TS. */
const twoByTwoTracks = {
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: '1fr 1fr',
};

export const gridVariant = styleVariants({
  1: [gridBase, { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }],
  2: [gridBase, { gridTemplateColumns: '1fr', gridTemplateRows: '1fr 1fr' }],
  3: [gridBase, twoByTwoTracks],
});
