import { style } from '@vanilla-extract/css';
import { layout } from '../../../theme/tokens.css';

export const topBarShellStyles = {
  root: style({
    width: '100%',
    height: '100%',
    direction: 'rtl',
    paddingInline: 'var(--mantine-spacing-md)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }),

  rightSection: style({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  }),

  rightSectionInner: style({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start', // right in RTL
    gap: '16px',
  }),

  centerSection: style({
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifySelf: 'center',
    minWidth: 0,
  }),

  centerSectionInner: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  leftSection: style({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
  }),

  leftSectionInner: style({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', // left in RTL
    gap: '16px',
  }),

  magenimIcon: style({
    width: layout.rightSidebarWidth,
    display: 'flex',
    justifyContent: 'center',
  }),

  title: style({
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '1.2',
    letterSpacing: '1px',
    color: '  #cbe7ffff',
  }),
  logo: style({
    height: '40px',
    width: 'auto',
    objectFit: 'contain',
  }),
};
