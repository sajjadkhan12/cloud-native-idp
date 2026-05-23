import { useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { calculateScore } from '../scoring';
import { ScoreBadge } from './ScoreBadge';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  makeStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  header: {
    paddingBottom: theme.spacing(1),
  },
  scoreWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    background: theme.palette.action.hover,
    borderRadius: 8,
    marginBottom: theme.spacing(2),
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  checkPassed: {
    color: '#4caf50',
  },
  checkFailed: {
    color: '#f44336',
  },
  suggestionSection: {
    marginTop: theme.spacing(2),
  },
  suggestionTitle: {
    fontWeight: 700,
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(1),
  },
  suggestionItem: {
    display: 'flex',
    gap: theme.spacing(1),
    background: '#fff3e0',
    color: '#e65100',
    padding: theme.spacing(1.5),
    borderRadius: 8,
    border: '1px solid #ffe0b2',
    marginBottom: theme.spacing(1),
  },
  suggestionIcon: {
    fontSize: 20,
    flexShrink: 0,
  },
}));

export const EntityScorecardCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [expanded, setExpanded] = useState(false);

  if (!entity) return null;

  const result = calculateScore(entity);
  const { totalScore, checks, tier } = result;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const failedChecks = checks.filter(c => !c.passed);

  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        title={
          <Typography variant="h6" style={{ fontWeight: 700 }}>
            Production Readiness Scorecard
          </Typography>
        }
        action={
          <IconButton
            className={`${classes.expand} ${expanded ? classes.expandOpen : ''}`}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent>
        <Box className={classes.scoreWrapper}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Overall Readiness
            </Typography>
            <Typography variant="h5" style={{ fontWeight: 800, marginTop: 4 }}>
              {totalScore} / 100
            </Typography>
          </Box>
          <ScoreBadge score={totalScore} tier={tier} />
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 8 }}>
            Checklist Breakdown
          </Typography>
          <List disablePadding>
            {checks.map(check => (
              <ListItem key={check.name} disableGutters style={{ padding: '6px 0' }}>
                <ListItemIcon style={{ minWidth: 36 }}>
                  {check.passed ? (
                    <CheckCircleIcon className={classes.checkPassed} />
                  ) : (
                    <CancelIcon className={classes.checkFailed} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                      {check.name} (+{check.maxPoints} pts)
                    </Typography>
                  }
                  secondary={check.description}
                />
              </ListItem>
            ))}
          </List>
          <Divider style={{ margin: '16px 0' }} />
        </Collapse>

        {failedChecks.length > 0 ? (
          <Box className={classes.suggestionSection}>
            <Typography className={classes.suggestionTitle}>
              Recommendations for Gold Tier
            </Typography>
            {failedChecks.slice(0, 2).map(check => (
              <Box key={check.name} className={classes.suggestionItem}>
                <HelpOutlineIcon className={classes.suggestionIcon} />
                <Box>
                  <Typography variant="body2" style={{ fontWeight: 700 }}>
                    {check.name}
                  </Typography>
                  <Typography variant="caption" style={{ marginTop: 4, display: 'inline-block' }}>
                    {check.suggestion}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box className={classes.suggestionSection}>
            <Box className={classes.suggestionItem} style={{ background: '#e8f5e9', color: '#1b5e20', border: '1px solid #c8e6c9' }}>
              <CheckCircleIcon className={classes.suggestionIcon} style={{ color: '#2e7d32' }} />
              <Box>
                <Typography variant="body2" style={{ fontWeight: 700 }}>
                  Excellent! Gold Standard Met
                </Typography>
                <Typography variant="caption" style={{ marginTop: 4, display: 'inline-block' }}>
                  This component meets all production readiness standards and is fully compliant.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
