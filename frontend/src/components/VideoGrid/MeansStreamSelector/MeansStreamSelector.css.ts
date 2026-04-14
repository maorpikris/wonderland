import { style } from '@vanilla-extract/css';
import { colors, radius, space, typography } from '@src/theme/tokens.css';

const selectColumnMax = '130px';

const controlColumn = style({
  alignSelf: 'center',
  width: `min(100%, ${selectColumnMax})`,
  maxWidth: '100%',
  minWidth: 0,
});

export const meansStreamSelectorStyles = {
  container: style({
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    borderRadius: 'clamp(4px, 1.2vmin, 8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 'clamp(12px, 4vmin, 35px)',
    padding: 'clamp(4px, 1.5vmin, 12px)',
    border: '2px solid var(--Colors-Neutral-Neutral-5, #475569)',
    background: 'var(--Overlays-Black-Alpha-3, rgba(0, 0, 0, 0.15))',
  }),

  videoIcon: style({
    width: 'clamp(36px, 12vmin, 56px)',
    height: 'clamp(36px, 12vmin, 56px)',
    aspectRatio: '1/1',
    opacity: 0.6,
    flexShrink: 0,
  }),

  controlColumn,

  addButton: style({
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    height: `${space.buttonHeight1} !important`,
    padding: `0 clamp(6px, 2vmin, ${space.spacing2}) !important`,
    borderRadius: radius.borderRadiusMax1,
    backgroundColor: `${colors.accent8} !important`,
    color: `${colors.accentContrast} !important`,
    border: 'none',
    '@media': {
      '(max-width: 480px)': {
        fontSize: 'clamp(8px, 2.8vw, 11px)',
      },
    },
  }),

  addButtonInner: style({
    gap: space.spacing1,
  }),

  addButtonLabel: style({
    color: colors.accentContrast,
    textAlign: 'right',
    fontFamily: typography.fontFamilyText,
    fontSize: typography.fontSize1,
    fontStyle: 'normal',
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeight1,
    letterSpacing: typography.letterSpacing1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  }),
  customSelectContainer: style([
    controlColumn,
    {
      position: 'relative',
    },
  ]),

  customSelectButton: style({
    width: `calc(100% - 10px)`,
    maxWidth: '100%',
    minWidth: 0,
    marginLeft: '10px',
    marginRight: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.spacing1,
    padding: `0 ${space.spacing2} !important`,
    height: space.buttonHeight1,
    boxSizing: 'border-box',
    backgroundColor: `${colors.neutralAlpha3} !important`,
    border: `1px solid ${colors.neutralAlpha8} !important`,
    borderRadius: radius.borderRadiusMax1,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyText,
    cursor: 'pointer',
  }),

  customSelectValue: style({
    flex: '1 1 0',
    minWidth: 0,
    textAlign: 'right',
    fontSize: typography.fontSize2,
    fontWeight: typography.fontWeightRegular,
    lineHeight: typography.lineHeight2,
    letterSpacing: typography.letterSpacing3,
    color: colors.textPrimary,
  }),

  customSelectChevron: style({
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '12px',
    height: '12px',
    color: 'inherit',
  }),

  customDropdown: style({
    position: 'absolute',
    top: '100%',
    insetInlineStart: 0,
    width: '100%',
    maxWidth: 'min(100%, calc(100vw - 16px))',
    minWidth: 0,
    boxSizing: 'border-box',
    marginTop: '4px',
    backgroundColor: colors.background,
    border: `1px solid ${colors.neutralAlpha3}`,
    borderRadius: radius.borderRadiusMax2,
    zIndex: 100,
    padding: space.spacing2,
    maxHeight: 'min(85vh, clamp(160px, 45vh, 280px))',
    display: 'flex',
    flexDirection: 'column',
    gap: space.spacing2,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'visible',
    boxShadow: `0px 12px 32px -16px ${colors.neutralAlpha5}, 0px 12px 60px 0px ${colors.blackAlpha3}`,
  }),

  customSearchContainer: style({
    width: '100%',
    minWidth: 0,
    flexShrink: 0,
  }),

  customSearchLeftSection: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: '2px !important',
    minWidth: 'unset !important',
  }),

  customSearchInput: style({
    height: `${space.buttonHeight1} !important`,
    minHeight: `${space.buttonHeight1} !important`,
    boxSizing: 'border-box',
    fontSize: `${typography.fontSize2} !important`,
    fontFamily: typography.fontFamilyText,
    fontWeight: typography.fontWeightMedium,
    lineHeight: `calc(${space.buttonHeight1} - 2px) !important`,
    letterSpacing: typography.letterSpacing3,
    color: `${colors.neutralAlpha9} !important`,
    borderRadius: radius.borderRadiusMax2,
    border: `1px solid ${colors.neutralAlpha5}`,
    backgroundColor: `${colors.surface} !important`,
    boxShadow: `inset 0px 1.5px 2px 0px ${colors.blackAlpha2}, inset 0px 1.5px 2px 0px ${colors.naturalAlpha2}`,
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    paddingInlineEnd: space.spacing1,
    textAlign: 'right !important' as unknown as 'right',
    '::placeholder': {
      color: `${colors.neutralAlpha9} !important`,
      opacity: '1',
      fontSize: typography.fontSize1,
      fontWeight: typography.fontWeightMedium,
      lineHeight: `calc(${space.buttonHeight1} - 2px) !important`,
    },
  }),

  customOptionsContainer: style({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    width: '100%',
    minWidth: 0,
  }),

  customOption: style({
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    height: '24px',
    padding: `0 ${space.spacing2} !important`,
    display: 'flex',
    alignItems: 'center',
    gap: space.spacing2,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyText,
    fontSize: typography.fontSize2,
    fontWeight: typography.fontWeightRegular,
    lineHeight: typography.lineHeight2,
    letterSpacing: typography.letterSpacing3,
    borderRadius: radius.borderRadiusMax2,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: colors.accent9,
      color: colors.accentContrast,
    },
    ':focus-visible': {
      backgroundColor: colors.accent9,
      color: colors.accentContrast,
      outline: 'none',
    },
  }),

  customOptionLabel: style({
    flex: '1 1 0',
    minWidth: 0,
    maxWidth: '100%',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'right',
  }),

  customEmpty: style({
    padding: space.spacing2,
    textAlign: 'center',
    color: colors.neutralAlpha9,
    fontFamily: typography.fontFamilyText,
    fontSize: typography.fontSize2,
  }),
};
