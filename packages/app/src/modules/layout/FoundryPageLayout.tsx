import { ReactNode, useMemo } from 'react';
import { NavLink, Link as RouterLink, useLocation } from 'react-router-dom';
import { useResolvedPath } from 'react-router-dom';
import { Box, Typography, makeStyles } from '@material-ui/core';
import type { PageLayoutProps } from '@backstage/frontend-plugin-api';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
    background: '#f0f2f5',
  },
  header: {
    flexShrink: 0,
    background: '#fff',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 1px 8px rgba(0,0,0,0.03)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2, 3, 1),
  },
  titleIcon: {
    display: 'flex',
    alignItems: 'center',
    color: '#0d7377',
    '& svg': {
      fontSize: 28,
    },
  },
  titleText: {
    fontWeight: 700,
    fontSize: '1.35rem',
    letterSpacing: '-0.02em',
    color: theme.palette.text.primary,
    textDecoration: 'none',
  },
  titleLink: {
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      color: '#0d7377',
    },
  },
  actions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: theme.spacing(1),
  },
  tabNav: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0, 3, 2),
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
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 0,
  },
}));

const resolveTabTo = (parentPath: string, tabHref: string) =>
  tabHref.startsWith('/')
    ? tabHref
    : `${parentPath}/${tabHref}`.replace(/\/{2,}/g, '/');

const isTabActive = (pathname: string, tabHref: string, parentPath: string) => {
  const resolved = resolveTabTo(parentPath, tabHref);
  return pathname === resolved || pathname.startsWith(`${resolved}/`);
};

export const FoundryPageLayout = ({
  title,
  icon,
  noHeader,
  titleLink,
  headerActions,
  tabs,
  children,
}: PageLayoutProps) => {
  const classes = useStyles();
  const location = useLocation();
  const parentPath = useResolvedPath('.').pathname.replace(/\/$/, '');

  const resolvedTabs = useMemo(
    () =>
      tabs?.map(tab => ({
        ...tab,
        to: resolveTabTo(parentPath, tab.href),
      })) ?? [],
    [tabs, parentPath],
  );

  const showTitle = Boolean(title && !noHeader);
  const showTabs = resolvedTabs.length > 0;

  if (!showTitle && !showTabs) {
    return (
      <div data-component="page-layout" className={classes.root}>
        <div className={classes.content}>{children}</div>
      </div>
    );
  }

  return (
    <div data-component="page-layout" className={classes.root}>
      <header className={classes.header}>
        {showTitle && (
          <Box className={classes.titleRow}>
            {icon && <span className={classes.titleIcon}>{icon}</span>}
            {titleLink ? (
              <RouterLink to={titleLink} className={classes.titleLink}>
                <Typography component="span" className={classes.titleText}>
                  {title}
                </Typography>
              </RouterLink>
            ) : (
              <Typography component="span" className={classes.titleText}>
                {title}
              </Typography>
            )}
            {headerActions && headerActions.length > 0 && (
              <div className={classes.actions}>
                {headerActions.filter(Boolean) as ReactNode[]}
              </div>
            )}
          </Box>
        )}
        {showTabs && (
          <nav className={classes.tabNav} aria-label="Page sections">
            {resolvedTabs.map(tab => {
              const active = isTabActive(location.pathname, tab.href, parentPath);
              return (
                <NavLink
                  key={tab.id}
                  to={tab.to}
                  className={`${classes.tab} ${active ? classes.tabActive : ''}`}
                >
                  {tab.icon}
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        )}
      </header>
      <div className={classes.content}>{children}</div>
    </div>
  );
};
