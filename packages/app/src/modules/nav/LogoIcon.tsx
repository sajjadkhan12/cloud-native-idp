import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 28,
    height: 28,
  },
});

export const LogoIcon = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#7df3e1"
        d="M16 2L4 10v12l12 8 12-8V10L16 2zm0 3.5L24 12v8l-8 5.5L8 20v-8l8-6.5z"
      />
      <path fill="#7df3e1" d="M16 10l-6 4v4l6 4 6-4v-4l-6-4z" opacity="0.6" />
    </svg>
  );
};
