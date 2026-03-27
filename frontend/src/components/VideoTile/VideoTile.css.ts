import { style } from '@vanilla-extract/css';

export const videoTileVideo = style({
  display: 'block',
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  objectFit: 'cover',
});

export const videoTile = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  selectors: {
    '&.is-popover-open': {
      overflow: 'visible',
    },
  },
});

export const videoTileBar = style({
  position: 'absolute',
  left: 0,
  right: 0,
  zIndex: 1,
  color: '#fff',
  fontSize: '12px',
  lineHeight: 1.2,
});

export const videoTileBarTop = style({
  top: 0,
});

export const videoTileBarBottom = style({
  bottom: 0,
});

export const videoTileBarAlways = style({
  opacity: 1,
  transform: 'translateY(0)',
});

export const videoTileBarHover = style({
  transform: 'translateY(100%)',
  transition: 'opacity 120ms ease, transform 160ms ease',
  selectors: {
    [`${videoTile}:hover &`]: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    [`${videoTile}.is-popover-open &`]: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
});
