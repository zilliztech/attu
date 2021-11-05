
import { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import { ProgressProps } from './Types';

const getStyles = makeStyles(() => ({
  root: {
    height: 'auto',
    transform: 'scaleY(-1)',
    width: '100%',

    "& line": {
      transformOrigin: '10px 15px',
    },
  },
}));

const Progress: FC<ProgressProps> = (props) => {
  const classes = getStyles();
  const { percent = 0, color = '#06F3AF' } = props;

  return (
    <svg className={classes.root} width="300" height="30" viewBox="0 0 300 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1={10} y1={15} x2={290} y2={15} vectorEffect="non-scaling-stroke" strokeWidth="12" stroke="#AEAEBB" strokeLinecap="round" />
      <line x1={10} y1={15} x2={290} y2={15} vectorEffect="non-scaling-stroke" transform={`scale(${percent}, 1)`} strokeWidth="12" stroke={color} strokeLinecap="round" />
    </svg >
  );
};

export default Progress;