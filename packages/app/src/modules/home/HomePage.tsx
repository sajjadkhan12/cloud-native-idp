import { useEffect, useState } from 'react';
import { Content, Link, Progress, Page } from '@backstage/core-components';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import CatalogIcon from '@material-ui/icons/MenuBook';
import CreateIcon from '@material-ui/icons/AddCircleOutline';
import ApiIcon from '@material-ui/icons/Extension';
import SearchIcon from '@material-ui/icons/Search';
import ImportIcon from '@material-ui/icons/CloudUpload';
import DocsIcon from '@material-ui/icons/Description';
import GitHubIcon from '@material-ui/icons/GitHub';
import NotificationsIcon from '@material-ui/icons/Notifications';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RocketLaunchIcon from '@material-ui/icons/FlightTakeoff';
import CodeIcon from '@material-ui/icons/Code';
import StorageIcon from '@material-ui/icons/Storage';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const RECENT_STORAGE_KEY = 'foundry-idp.recentlyVisited';
const MAX_RECENT = 8;

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.background.default,
    minHeight: '100%',
  },
  heroWrapper: {
    position: 'relative',
    marginBottom: theme.spacing(6),
    overflow: 'hidden',
  },
  heroBanner: {
    position: 'relative',
    height: 220,
    background: 'linear-gradient(135deg, #0d7377 0%, #14a085 40%, #7df3e1 100%)',
    clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 100%)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    overflow: 'hidden',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 600,
  },
  heroTitle: {
    color: '#fff',
    fontWeight: 800,
    fontSize: '3.5rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    textShadow: '0 2px 20px rgba(0,0,0,0.15)',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1.1rem',
    marginTop: theme.spacing(1),
    fontWeight: 400,
  },
  heroDecor: {
    position: 'absolute',
    right: theme.spacing(4),
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: theme.spacing(3),
    opacity: 0.25,
    zIndex: 1,
  },
  heroIcon: {
    fontSize: 72,
    color: '#000',
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: 720,
    margin: '0 auto',
    marginTop: -36,
    padding: theme.spacing(0, 3),
    zIndex: 3,
  },
  searchBar: {
    background: '#fff',
    borderRadius: 50,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    padding: theme.spacing(0.5, 2),
    '& .MuiInputBase-root': {
      fontSize: '1.25rem',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  contentGrid: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: theme.spacing(0, 3, 6),
  },
  sectionCard: {
    height: '100%',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: `1px solid ${theme.palette.divider}`,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  quickLink: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'background 0.15s ease',
    borderRadius: 6,
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  kindTag: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: '0.7rem',
    fontWeight: 600,
    marginRight: theme.spacing(1.5),
    minWidth: 90,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  tagComponent: {
    background: '#6b4423',
    color: '#fff',
  },
  tagTemplate: {
    background: '#6554c0',
    color: '#fff',
  },
  tagApi: {
    background: '#0052cc',
    color: '#fff',
  },
  tagSystem: {
    background: '#00875a',
    color: '#fff',
  },
  tagDefault: {
    background: theme.palette.grey[600],
    color: '#fff',
  },
  toolboxGrid: {
    marginTop: theme.spacing(1),
  },
  toolItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderRadius: 12,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s ease',
    position: 'relative',
    '&:hover': {
      background: theme.palette.action.hover,
      transform: 'translateY(-2px)',
    },
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(1),
    fontSize: 28,
    color: '#fff',
  },
  toolLabel: {
    fontSize: '0.8rem',
    fontWeight: 500,
    textAlign: 'center',
  },
  externalBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 14,
    color: theme.palette.text.secondary,
  },
  featuredCard: {
    marginTop: theme.spacing(3),
    borderRadius: 12,
    background: 'linear-gradient(135deg, rgba(13,115,119,0.08) 0%, rgba(125,243,225,0.12) 100%)',
    border: '1px solid rgba(125,243,225,0.3)',
  },
  featuredTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  emptyState: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    padding: theme.spacing(2, 0),
  },
}));

type RecentVisit = {
  name: string;
  namespace: string;
  kind: string;
  visitedAt: number;
};

const kindTagClass = (kind: string, classes: ReturnType<typeof useStyles>) => {
  switch (kind.toLowerCase()) {
    case 'component':
      return classes.tagComponent;
    case 'template':
      return classes.tagTemplate;
    case 'api':
      return classes.tagApi;
    case 'system':
      return classes.tagSystem;
    default:
      return classes.tagDefault;
  }
};

const toolboxItems = [
  {
    label: 'Catalog',
    href: '/catalog',
    icon: CatalogIcon,
    color: '#0d7377',
  },
  {
    label: 'Create',
    href: '/create',
    icon: CreateIcon,
    color: '#6554c0',
  },
  {
    label: 'API Docs',
    href: '/api-docs',
    icon: ApiIcon,
    color: '#0052cc',
  },
  {
    label: 'Search',
    href: '/search',
    icon: SearchIcon,
    color: '#172b4d',
  },
  {
    label: 'Import',
    href: '/catalog-import',
    icon: ImportIcon,
    color: '#00875a',
  },
  {
    label: 'Docs',
    href: '/search?query=kind%3Adocumentation',
    icon: DocsIcon,
    color: '#ff5630',
  },
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: GitHubIcon,
    color: '#24292e',
    external: true,
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: NotificationsIcon,
    color: '#ff991f',
  },
];

export const HomePage = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [recent, setRecent] = useState<RecentVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        setRecent(JSON.parse(stored).slice(0, MAX_RECENT));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .getEntities({
        filter: { kind: ['Component', 'Template', 'API', 'System'] },
        fields: ['metadata.name', 'metadata.namespace', 'kind', 'spec.type'],
      })
      .then(response => {
        if (!cancelled) {
          setEntities(response.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [catalogApi]);

  const templates = entities.filter(e => e.kind === 'Template');
  const featuredTemplate = templates.find(
    t => t.metadata.name === 'python-fastapi',
  ) ?? templates[0];

  const quickLinks =
    recent.length > 0
      ? recent
      : entities.slice(0, 6).map(e => ({
          name: e.metadata.name,
          namespace: e.metadata.namespace ?? 'default',
          kind: e.kind,
          visitedAt: 0,
        }));

  return (
    <Page themeId="home">
      <Content className={classes.root}>
        <Box className={classes.heroWrapper}>
          <Box className={classes.heroBanner}>
            <Box className={classes.heroDecor}>
              <RocketLaunchIcon className={classes.heroIcon} />
              <CodeIcon className={classes.heroIcon} />
              <StorageIcon className={classes.heroIcon} />
            </Box>
            <Box className={classes.heroContent}>
              <Typography className={classes.heroTitle}>
                Foundry IDP
              </Typography>
              <Typography className={classes.heroSubtitle}>
                Your cloud-native developer portal — catalog, create, and ship
                faster.
              </Typography>
            </Box>
          </Box>
          <Box className={classes.searchWrapper}>
            <HomePageSearchBar
              placeholder="Search Foundry IDP"
              InputProps={{ className: classes.searchBar }}
            />
          </Box>
        </Box>

        <Grid container spacing={3} className={classes.contentGrid}>
          <Grid item xs={12} md={6}>
            <Card className={classes.sectionCard}>
              <CardContent>
                <Typography className={classes.sectionTitle}>
                  Quick access
                </Typography>
                {loading && <Progress />}
                {!loading && quickLinks.length === 0 && (
                  <Typography className={classes.emptyState}>
                    Browse the catalog to populate quick access links.
                  </Typography>
                )}
                {quickLinks.map(item => (
                  <Link
                    key={`${item.kind}:${item.namespace}/${item.name}`}
                    to={`/catalog/${item.namespace}/${item.kind.toLowerCase()}/${item.name}`}
                    className={classes.quickLink}
                    underline="none"
                  >
                    <span
                      className={`${classes.kindTag} ${kindTagClass(item.kind, classes)}`}
                    >
                      {item.kind}
                    </span>
                    <Typography style={{ flex: 1, fontWeight: 500 }}>
                      {item.name}
                    </Typography>
                    <ChevronRightIcon color="disabled" />
                  </Link>
                ))}

                {featuredTemplate && (
                  <Card className={classes.featuredCard} elevation={0}>
                    <CardContent>
                      <Typography className={classes.featuredTitle}>
                        Featured template
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {featuredTemplate.metadata.description ??
                          'Scaffold a new service from a golden path template.'}
                      </Typography>
                      <Box mt={1.5}>
                        <Link
                          to={`/create/templates/default/${featuredTemplate.metadata.name}`}
                        >
                          Create {featuredTemplate.metadata.title ?? featuredTemplate.metadata.name}
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={classes.sectionCard}>
              <CardContent>
                <Typography className={classes.sectionTitle}>
                  Toolbox
                </Typography>
                <Grid container spacing={1} className={classes.toolboxGrid}>
                  {toolboxItems.map(tool => {
                    const Icon = tool.icon;
                    const content = (
                      <>
                        {tool.external && (
                          <OpenInNewIcon className={classes.externalBadge} />
                        )}
                        <Box
                          className={classes.toolIcon}
                          style={{ background: tool.color }}
                        >
                          <Icon fontSize="inherit" />
                        </Box>
                        <Typography className={classes.toolLabel}>
                          {tool.label}
                        </Typography>
                      </>
                    );

                    return (
                      <Grid item xs={6} sm={3} key={tool.label}>
                        {tool.external ? (
                          <a
                            href={tool.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={classes.toolItem}
                          >
                            {content}
                          </a>
                        ) : (
                          <Link
                            to={tool.href}
                            className={classes.toolItem}
                            underline="none"
                          >
                            {content}
                          </Link>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
