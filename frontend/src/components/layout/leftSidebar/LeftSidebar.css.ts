import { style } from '@vanilla-extract/css';
import { colors, typography, space } from '../../../theme/tokens.css';

export const leftSidebarStyles = {
  root: style({
    padding: space.spacing2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
  }),

  header: style({
    marginBottom: '16px',
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyText,
    fontSize: '20px',
    fontWeight: typography.fontWeightMedium,
  }),

  scrollArea: style({
    flex: 1,
  }),

  card: style({
    backgroundColor: `${colors.neutralAlpha3} !important`,
    backdropFilter: 'blur(8px)',
    borderRadius: '12px !important',
    border: `1px solid ${colors.border} !important`,
    padding: '10px !important',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    selectors: {
      '&:hover': {
        backgroundColor: `${colors.neutralAlpha5} !important`,
        borderColor: `${colors.neutralAlpha8} !important`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '4px',
        height: '100%',
        backgroundColor: colors.accent8,
        opacity: 0,
        transition: 'opacity 0.2s ease',
      },
      '&:hover::before': {
        opacity: 1,
      },
    },
  }),

  cardHeader: style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
  }),

  cameraName: style({
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyText,
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    lineHeight: '1.4',
  }),

  cameraId: style({
    color: colors.naturalNatural7,
    fontSize: '10px',
    fontFamily: typography.fontFamilyText,
    marginTop: '0px',
    opacity: 0.7,
  }),

  badgeContainer: style({
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '8px',
  }),

  badge: style({
    height: '20px',
    padding: '0 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  editButton: style({
    marginTop: '10px',
    height: '28px !important',
    backgroundColor: `${colors.neutralAlpha5} !important`,
    border: `1px solid ${colors.border} !important`,
    color: `${colors.textPrimary} !important`,
    transition: 'all 0.2s ease',
    selectors: {
      '&:hover': {
        backgroundColor: `${colors.accent8} !important`,
        borderColor: `${colors.accent8} !important`,
      },
    },
  }),
};
