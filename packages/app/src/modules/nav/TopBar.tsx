import { ReactNode, useEffect, useState } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link, sidebarConfig } from '@backstage/core-components';
import { ProfileMenu } from './ProfileMenu';
import { TOP_BAR_HEIGHT, topBarMenuItems } from './topBarMenuItems';

const useStyles = makeStyles(theme => ({
  topBar: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: TOP_BAR_HEIGHT,
    zIndex: theme.zIndex.drawer + 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 2),
    background: '#ffffff',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
    transition: theme.transitions.create('left'),
  },
  menuSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    minWidth: 0,
    flex: 1,
  },
  menuItem: {
    padding: theme.spacing(0.75, 1.5),
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s ease, background 0.15s ease',
    '&:hover': {
      color: theme.palette.text.primary,
      background: 'rgba(0, 0, 0, 0.04)',
    },
  },
  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginLeft: 'auto',
    flexShrink: 0,
  },
  contentOffset: {
    paddingTop: TOP_BAR_HEIGHT,
  },
}));

const readSidebarWidth = (isPinned: boolean) =>
  isPinned ? sidebarConfig.drawerWidthOpen : sidebarConfig.drawerWidthClosed;

export const TopBar = () => {
  const classes = useStyles();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const pinned = JSON.parse(
        window.localStorage.getItem('sidebarPinState') ?? 'true',
      );
      return readSidebarWidth(!!pinned);
    } catch {
      return readSidebarWidth(true);
    }
  });

  useEffect(() => {
    const syncSidebarWidth = () => {
      try {
        const pinned = JSON.parse(
          window.localStorage.getItem('sidebarPinState') ?? 'true',
        );
        setSidebarWidth(readSidebarWidth(!!pinned));
      } catch {
        setSidebarWidth(readSidebarWidth(true));
      }
    };

    syncSidebarWidth();
    window.addEventListener('storage', syncSidebarWidth);
    const interval = window.setInterval(syncSidebarWidth, 400);

    return () => {
      window.removeEventListener('storage', syncSidebarWidth);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <Box
      className={classes.topBar}
      style={{ left: isMobile ? 0 : sidebarWidth }}
      data-testid="foundry-top-bar"
    >
      <nav className={classes.menuSection} aria-label="Top navigation">
        {topBarMenuItems.map(item =>
          item.external ? (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.menuItem}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.id}
              to={item.href}
              underline="none"
              className={classes.menuItem}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <div className={classes.actionsSection}>
        <ProfileMenu />
      </div>
    </Box>
  );
};

export const AppShellWrapper = ({ children }: { children: ReactNode }) => {
  const classes = useStyles();

  return (
    <>
      <TopBar />
      <Box className={classes.contentOffset}>{children}</Box>
    </>
  );
};
