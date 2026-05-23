import { Box, Chip, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  gold: {
    background: 'linear-gradient(135deg, #ffd700, #ffa500)',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  silver: {
    background: 'linear-gradient(135deg, #e0e0e0, #9e9e9e)',
  },
  bronze: {
    background: 'linear-gradient(135deg, #d7ccc8, #8d6e63)',
  },
  needsImprovement: {
    background: 'linear-gradient(135deg, #ff8a80, #e53935)',
  },
  chip: {
    fontWeight: 600,
    fontSize: '0.75rem',
  },
}));

type ScoreBadgeProps = {
  score: number;
  tier: 'Gold' | 'Silver' | 'Bronze' | 'Needs Improvement';
  hideLabel?: boolean;
};

export const ScoreBadge = ({ score, tier, hideLabel }: ScoreBadgeProps) => {
  const classes = useStyles();

  const getTierClass = () => {
    switch (tier) {
      case 'Gold':
        return classes.gold;
      case 'Silver':
        return classes.silver;
      case 'Bronze':
        return classes.bronze;
      default:
        return classes.needsImprovement;
    }
  };

  const getChipColor = () => {
    switch (tier) {
      case 'Gold':
        return 'primary';
      case 'Silver':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={`${classes.badge} ${getTierClass()}`}>
        {score}
      </Box>
      {!hideLabel && (
        <Chip
          label={tier}
          size="small"
          color={getChipColor()}
          className={classes.chip}
          style={{
            background: tier === 'Gold' ? '#ffd700' : tier === 'Silver' ? '#e0e0e0' : tier === 'Bronze' ? '#d7ccc8' : '#ff8a80',
            color: tier === 'Gold' || tier === 'Silver' || tier === 'Bronze' ? '#333' : '#fff',
          }}
        />
      )}
    </Box>
  );
};
