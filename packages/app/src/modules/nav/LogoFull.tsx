import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },
  title: {
    fontWeight: 700,
    fontSize: '1.05rem',
    color: '#7df3e1',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  },
});

export const LogoFull = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <svg
        className={classes.icon}
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#7df3e1"
          d="M16 2L4 10v12l12 8 12-8V10L16 2zm0 3.5L24 12v8l-8 5.5L8 20v-8l8-6.5z"
        />
        <path fill="#7df3e1" d="M16 10l-6 4v4l6 4 6-4v-4l-6-4z" opacity="0.6" />
      </svg>
      <Typography className={classes.title} component="span">
        Foundry IDP
      </Typography>
    </div>
  );
};
