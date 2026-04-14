import { style, globalStyle } from '@vanilla-extract/css';
import { colors } from '@src/theme/tokens.css';

const borderColor = 'rgba(255, 255, 255, 0.1)';
const trayShadow = '0 18px 32px rgba(5, 11, 24, 0.42)';

export const mapContextMenuStyles = {
  popup: style({
    zIndex: 1000,
  }),
  button: style({
    color: `${colors.textPrimary} !important`,
    transition: 'background-color 140ms ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
    },
  }),
};

globalStyle(`${mapContextMenuStyles.popup} .maplibregl-popup-content`, {
  backgroundColor: 'rgba(13, 21, 35, 0.96)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${borderColor}`,
  borderRadius: 12,
  boxShadow: trayShadow,
  padding: '6px',
  color: colors.textPrimary,
});

globalStyle(
  `${mapContextMenuStyles.popup}.maplibregl-popup-anchor-bottom .maplibregl-popup-tip`,
  {
    borderTopColor: 'rgba(13, 21, 35, 0.96)',
  },
);
globalStyle(
  `${mapContextMenuStyles.popup}.maplibregl-popup-anchor-top .maplibregl-popup-tip`,
  {
    borderBottomColor: 'rgba(13, 21, 35, 0.96)',
  },
);
globalStyle(
  `${mapContextMenuStyles.popup}.maplibregl-popup-anchor-left .maplibregl-popup-tip`,
  {
    borderRightColor: 'rgba(13, 21, 35, 0.96)',
  },
);
globalStyle(
  `${mapContextMenuStyles.popup}.maplibregl-popup-anchor-right .maplibregl-popup-tip`,
  {
    borderLeftColor: 'rgba(13, 21, 35, 0.96)',
  },
);
globalStyle(
  `${mapContextMenuStyles.popup}.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip`,
  {
    borderTopColor: 'rgba(13, 21, 35, 0.96)',
  },
);
globalStyle(
  `${mapContextMenuStyles.popup}.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip`,
  {
    borderTopColor: 'rgba(13, 21, 35, 0.96)',
  },
);
globalStyle(
  `${mapContextMenuStyles.popup}.maplibregl-popup-anchor-top-left .maplibregl-popup-tip`,
  {
    borderBottomColor: 'rgba(13, 21, 35, 0.96)',
  },
);
globalStyle(
  `${mapContextMenuStyles.popup}.maplibregl-popup-anchor-top-right .maplibregl-popup-tip`,
  {
    borderBottomColor: 'rgba(13, 21, 35, 0.96)',
  },
);
