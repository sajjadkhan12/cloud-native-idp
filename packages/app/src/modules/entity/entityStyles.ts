import { makeStyles } from '@material-ui/core';

export const useEntityStyles = makeStyles(theme => ({
  pageRoot: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    background: '#f0f2f5',
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0d7377 0%, #14a085 45%, #1cb5a3 100%)',
    color: '#fff',
    padding: theme.spacing(3, 3, 2.5),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3.5, 4, 3),
    },
  },
  heroDecor: {
    position: 'absolute',
    right: theme.spacing(2),
    top: '50%',
    transform: 'translateY(-50%)',
    opacity: 0.12,
    pointerEvents: 'none',
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
    '& svg': {
      fontSize: 140,
    },
  },
  heroTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    position: 'relative',
    zIndex: 1,
  },
  heroMain: {
    minWidth: 0,
    flex: 1,
  },
  breadcrumb: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    opacity: 0.85,
    marginBottom: theme.spacing(0.75),
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
  },
  title: {
    fontWeight: 800,
    fontSize: '2rem',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    [theme.breakpoints.up('md')]: {
      fontSize: '2.35rem',
    },
  },
  description: {
    marginTop: theme.spacing(1),
    maxWidth: 720,
    opacity: 0.92,
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    flexShrink: 0,
    '& .MuiIconButton-root': {
      color: '#fff',
    },
  },
  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    position: 'relative',
    zIndex: 1,
  },
  metaChip: {
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.78rem',
    height: 30,
    backdropFilter: 'blur(8px)',
    '& .MuiChip-label': {
      paddingLeft: theme.spacing(1.25),
      paddingRight: theme.spacing(1.25),
    },
  },
  metaChipLabel: {
    opacity: 0.8,
    fontWeight: 700,
    marginRight: theme.spacing(0.5),
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: '0.65rem',
  },
  menuButton: {
    color: '#fff',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    '&:hover': {
      background: 'rgba(255,255,255,0.2)',
    },
  },
  tabBar: {
    background: '#fff',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 1px 8px rgba(0,0,0,0.03)',
    padding: theme.spacing(1.5, 2, 2),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(1.5, 3, 2),
    },
  },
  tabNav: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.85, 1.75),
    borderRadius: 10,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
    '& svg': {
      fontSize: 18,
      opacity: 0.85,
    },
    '&:hover': {
      color: '#0d7377',
      background: 'rgba(125, 243, 225, 0.12)',
    },
  },
  tabActive: {
    color: '#0d7377',
    background: '#fff',
    borderColor: 'rgba(13, 115, 119, 0.18)',
    boxShadow: '0 2px 10px rgba(13, 115, 119, 0.12)',
    '& svg': {
      opacity: 1,
    },
  },
  content: {
    flex: 1,
    padding: theme.spacing(2.5, 2, 4),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3, 3, 4),
    },
  },
  warningArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '&:empty': {
      display: 'none',
    },
  },
  overviewGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    [theme.breakpoints.up('md')]: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.65fr) minmax(280px, 1fr)',
      gap: theme.spacing(2.5),
      alignItems: 'start',
    },
  },
  mainColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    minWidth: 0,
  },
  sideColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    minWidth: 0,
    [theme.breakpoints.up('md')]: {
      position: 'sticky',
      top: theme.spacing(2),
    },
  },
  cardShell: {
    '& > .MuiPaper-root, & > article > .MuiPaper-root': {
      borderRadius: 16,
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    },
    '& .MuiCardHeader-root': {
      padding: theme.spacing(2, 2.5, 1.5),
    },
    '& .MuiCardHeader-title': {
      fontWeight: 700,
      fontSize: '1rem',
      letterSpacing: '-0.01em',
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(0, 2.5, 2.5),
    },
    '& .MuiChip-root': {
      borderRadius: 8,
      fontWeight: 600,
      fontSize: '0.72rem',
      height: 26,
    },
    '& a': {
      color: '#0d7377',
      fontWeight: 600,
      textDecoration: 'none',
      '&:hover': {
        color: '#14a085',
        textDecoration: 'underline',
      },
    },
  },
}));
