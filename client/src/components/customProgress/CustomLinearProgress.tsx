import {
  makeStyles,
  withStyles,
  Theme,
  LinearProgress,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { FC } from 'react';
import { CustomLinearProgressProps } from './Types';

const getProgressStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  percent: {
    minWidth: '35px',
    marginLeft: theme.spacing(1),
    color: theme.palette.attuDark.main,
  },
}));

const BorderLinearProgress = withStyles((theme: Theme) => ({
  root: {
    height: 10,
    border: '1px solid #e9e9ed',
    minWidth: 85,
  },
  colorPrimary: {
    backgroundColor: '#fff',
  },
  bar: {
    backgroundColor: theme.palette.primary.main,
  },
}))(LinearProgress);

const CustomLinearProgress: FC<CustomLinearProgressProps> = ({
  value,
  tooltip = '',
  wrapperClass = '',
}) => {
  const classes = getProgressStyles();

  return (
    <div className={`${classes.wrapper} ${wrapperClass}`}>
      {tooltip !== '' ? (
        <Tooltip title={tooltip} aria-label={tooltip} arrow>
          <BorderLinearProgress variant="determinate" value={value} />
        </Tooltip>
      ) : (
        <BorderLinearProgress variant="determinate" value={value} />
      )}
      <Typography
        variant="body1"
        className={classes.percent}
      >{`${value}%`}</Typography>
    </div>
  );
};

export default CustomLinearProgress;
