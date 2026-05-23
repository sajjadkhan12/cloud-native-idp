import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { calculateScore } from '../scoring';
import { ScoreBadge } from './ScoreBadge';
import {
  Content,
  Header,
  Page,
  Progress,
  Link,
} from '@backstage/core-components';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  makeStyles,
  LinearProgress,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  titleSection: {
    marginBottom: theme.spacing(4),
  },
  statsBanner: {
    marginBottom: theme.spacing(4),
  },
  statCard: {
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  statValue: {
    fontWeight: 800,
    fontSize: '2rem',
    color: '#0d7377',
    marginTop: theme.spacing(1),
  },
  filterCard: {
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    padding: theme.spacing(2),
  },
  tableCard: {
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  tableHead: {
    background: theme.palette.action.hover,
    '& th': {
      fontWeight: 700,
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.05em',
    },
  },
  row: {
    transition: 'background 0.2s ease',
    '&:hover': {
      background: 'rgba(13, 115, 119, 0.04)',
    },
  },
  entityName: {
    fontWeight: 600,
    textDecoration: 'none',
    color: '#0d7377',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  barGold: {
    backgroundColor: '#4caf50',
  },
  barSilver: {
    backgroundColor: '#2196f3',
  },
  barBronze: {
    backgroundColor: '#ff9800',
  },
  barNeedsImprovement: {
    backgroundColor: '#f44336',
  },
}));

type GradedComponent = {
  entity: Entity;
  name: string;
  namespace: string;
  owner: string;
  lifecycle: string;
  system: string;
  score: number;
  tier: 'Gold' | 'Silver' | 'Bronze' | 'Needs Improvement';
};

export const ScorecardsPage = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [components, setComponents] = useState<GradedComponent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  useEffect(() => {
    let active = true;
    catalogApi.getEntities({
      filter: { kind: 'Component' },
      fields: [
        'metadata.name',
        'metadata.namespace',
        'metadata.description',
        'metadata.tags',
        'metadata.annotations',
        'spec.owner',
        'spec.type',
        'spec.lifecycle',
        'spec.system',
        'relations',
      ],
    }).then(res => {
      if (active) {
        const graded = res.items.map(entity => {
          const scoreResult = calculateScore(entity);
          const owner = String(entity.spec?.owner ?? 'unknown');
          const lifecycle = String(entity.spec?.lifecycle ?? 'unknown');
          const system = String((entity.spec as { system?: string })?.system ?? 'none');
          return {
            entity,
            name: entity.metadata.name,
            namespace: entity.metadata.namespace ?? 'default',
            owner,
            lifecycle,
            system,
            score: scoreResult.totalScore,
            tier: scoreResult.tier,
          };
        });
        // Sort descending by score
        graded.sort((a, b) => b.score - a.score);
        setComponents(graded);
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [catalogApi]);

  if (loading) {
    return (
      <Page themeId="home">
        <Header title="Production Readiness Leaderboard" subtitle="Grading and tracking platform components" />
        <Content>
          <Progress />
        </Content>
      </Page>
    );
  }

  // Summary Metrics
  const totalCount = components.length;
  const avgScore = totalCount > 0 ? Math.round(components.reduce((sum, c) => sum + c.score, 0) / totalCount) : 0;
  const goldCount = components.filter(c => c.tier === 'Gold').length;
  const silverCount = components.filter(c => c.tier === 'Silver').length;

  const goldPercent = totalCount > 0 ? Math.round((goldCount / totalCount) * 100) : 0;
  const compliancePercent = totalCount > 0 ? Math.round(((goldCount + silverCount) / totalCount) * 100) : 0;

  // Extract unique owners for filter dropdown
  const uniqueOwners = Array.from(new Set(components.map(c => c.owner)));

  // Filtered list
  const filteredComponents = components.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.system.toLowerCase().includes(search.toLowerCase());
    const matchesOwner = ownerFilter === 'all' || c.owner === ownerFilter;
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchesSearch && matchesOwner && matchesTier;
  });

  const getProgressColorClass = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return classes.barGold;
      case 'Silver':
        return classes.barSilver;
      case 'Bronze':
        return classes.barBronze;
      default:
        return classes.barNeedsImprovement;
    }
  };

  return (
    <Page themeId="home">
      <Header
        title="Production Readiness Leaderboard"
        subtitle="Rankings and scorecards for all registered service catalog components"
      />
      <Content className={classes.root}>
        {/* Banner Stats */}
        <Grid container spacing={3} className={classes.statsBanner}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statCard}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Graded Components</Typography>
                <Typography className={classes.statValue}>{totalCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statCard}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Average Portal Score</Typography>
                <Typography className={classes.statValue}>{avgScore} / 100</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statCard}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Gold Tier Ratio</Typography>
                <Typography className={classes.statValue}>{goldPercent}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.statCard}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">Compliance Rate (Gold/Silver)</Typography>
                <Typography className={classes.statValue}>{compliancePercent}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Card */}
        <Card className={classes.filterCard}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Search components..."
                variant="outlined"
                fullWidth
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Filter by Owner"
                variant="outlined"
                fullWidth
                size="small"
                value={ownerFilter}
                onChange={e => setOwnerFilter(e.target.value)}
              >
                <MenuItem value="all">All Owners</MenuItem>
                {uniqueOwners.map(owner => (
                  <MenuItem key={owner} value={owner}>{owner}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Filter by Tier"
                variant="outlined"
                fullWidth
                size="small"
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
              >
                <MenuItem value="all">All Tiers</MenuItem>
                <MenuItem value="Gold">Gold (&gt;=80)</MenuItem>
                <MenuItem value="Silver">Silver (60-79)</MenuItem>
                <MenuItem value="Bronze">Bronze (40-59)</MenuItem>
                <MenuItem value="Needs Improvement">Needs Improvement (&lt;40)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Card>

        {/* Leaderboard Table */}
        <TableContainer component={Paper} className={classes.tableCard}>
          <Table>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Component Name</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>System</TableCell>
                <TableCell>Readiness Progress</TableCell>
                <TableCell>Readiness Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComponents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="textSecondary" style={{ padding: '24px 0' }}>
                      No components found matching the selected filter criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredComponents.map((comp, index) => (
                  <TableRow key={`${comp.namespace}/${comp.name}`} className={classes.row}>
                    <TableCell style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      #{index + 1}
                    </TableCell>
                    <TableCell>
                      <Link
                        className={classes.entityName}
                        to={`/catalog/${comp.namespace}/component/${comp.name}`}
                      >
                        {comp.name}
                      </Link>
                    </TableCell>
                    <TableCell style={{ textTransform: 'capitalize' }}>
                      {comp.owner.split('/').pop()}
                    </TableCell>
                    <TableCell style={{ textTransform: 'capitalize' }}>
                      {comp.system}
                    </TableCell>
                    <TableCell style={{ width: '30%' }}>
                      <Box display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                          <LinearProgress
                            variant="determinate"
                            value={comp.score}
                            classes={{
                              barColorPrimary: getProgressColorClass(comp.tier),
                            }}
                            className={classes.progressBar}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={comp.score} tier={comp.tier} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Content>
    </Page>
  );
};
