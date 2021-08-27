
import { makeStyles, Theme } from '@material-ui/core';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    transform: 'scaleY(-1)',
  },
  ycoord: {
    cursor: 'pointer',

    "&:hover": {
      "& line": {
        transition: 'all .25s',
        opacity: 1,
      },

      "& circle": {
        transition: 'all .25s',
        fill: '#06AFF2',
      },
    },
  }
}));

const Progress = (props: any) => {
  const classes = getStyles();
  const { percent = 0, color = '#06F3AF' } = props;

  return (
    <svg className={classes.root} width="300" height="100" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1={10} y1={50} x2={250} y2={50} stroke-width="12" stroke="#AEAEBB" stroke-linecap="round" />
      <line x1={10} y1={50} x2={250 * percent / 100} y2={50} stroke-width="12" stroke={color} stroke-linecap="round" />
    </svg >
  );
};

export default Progress;