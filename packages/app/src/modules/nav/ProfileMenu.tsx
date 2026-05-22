import { useEffect, useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  makeStyles,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import SettingsIcon from '@material-ui/icons/Settings';
import SignOutIcon from '@material-ui/icons/MeetingRoom';
import {
  errorApiRef,
  identityApiRef,
  useAnalytics,
  useApi,
} from '@backstage/core-plugin-api';
import { Link } from '@backstage/core-components';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

const useStyles = makeStyles(theme => ({
  trigger: {
    textTransform: 'none',
    color: theme.palette.text.primary,
    padding: theme.spacing(0.5, 1),
    borderRadius: 8,
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.04)',
    },
  },
  triggerInner: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  avatar: {
    width: 32,
    height: 32,
    fontSize: '0.85rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #0d7377, #7df3e1)',
    color: '#fff',
  },
  name: {
    fontWeight: 600,
    fontSize: '0.875rem',
    maxWidth: 140,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  chevron: {
    color: theme.palette.text.secondary,
    fontSize: 20,
  },
  menuHeader: {
    padding: theme.spacing(2, 2, 1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    minWidth: 220,
  },
  menuName: {
    fontWeight: 600,
    lineHeight: 1.3,
  },
  menuEmail: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.25),
  },
}));

const getInitials = (name: string) =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

export const ProfileMenu = () => {
  const classes = useStyles();
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const errorApi = useApi(errorApiRef);
  const analytics = useAnalytics();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { value, loading } = useAsync(async () => {
    const [profile, identity] = await Promise.all([
      identityApi.getProfileInfo(),
      identityApi.getBackstageIdentity(),
    ]);

    let picture = profile.picture;
    try {
      const entity = await catalogApi.getEntityByRef(identity.userEntityRef);
      picture = picture ?? entity?.spec?.profile?.picture;
    } catch {
      // Catalog enrichment is optional.
    }

    const fallbackName =
      identity.userEntityRef.split('/').pop()?.replace(/[-_]/g, ' ') ?? 'User';

    return {
      profile: { ...profile, picture },
      displayName: profile.displayName ?? fallbackName,
      email: profile.email,
    };
  }, [identityApi, catalogApi]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    identityApi.signOut().catch(error => errorApi.post(error));
    analytics.captureEvent('signOut', 'success');
  };

  const displayName = value?.displayName ?? 'User';
  const profile = value?.profile ?? {};

  return (
    <>
      <Button
        className={classes.trigger}
        onClick={handleOpen}
        aria-label="Open profile menu"
        data-testid="profile-menu-button"
        disabled={loading}
      >
        <span className={classes.triggerInner}>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Avatar
              src={profile.picture}
              alt={displayName}
              className={classes.avatar}
            >
              {!profile.picture ? getInitials(displayName) : null}
            </Avatar>
          )}
          <Typography className={classes.name}>{displayName}</Typography>
          <ArrowDropDownIcon className={classes.chevron} />
        </span>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        getContentAnchorEl={null}
      >
        <Box className={classes.menuHeader}>
          <Typography className={classes.menuName}>{displayName}</Typography>
          {value?.email && (
            <Typography variant="caption" className={classes.menuEmail}>
              {value.email}
            </Typography>
          )}
        </Box>
        <MenuItem
          component={Link}
          to="/settings"
          onClick={handleClose}
          data-testid="profile-settings"
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleSignOut} data-testid="profile-sign-out">
          <ListItemIcon>
            <SignOutIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
};
