import { Theme } from '@mui/material';
import { Dispatch, Fragment, SetStateAction } from 'react';
import { timeRangeOptions } from './consts';
import { ITimeRangeOption } from './Types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '14px',
    display: 'flex',
    alignItems: 'flex-end',
    color: '#999',
    fontWeight: 500,
  },
  divider: {
    margin: '0 4px',
  },
  label: {
    cursor: 'pointer',
    '&:hover': {
      fontSize: '16px',
    },
  },
  active: {
    fontWeight: 600,
    fontSize: '16px',
    color: '#222',
  },
}));

const TimeRangeTabs = ({
  timeRange,
  setTimeRange,
}: {
  timeRange: ITimeRangeOption;
  setTimeRange: Dispatch<SetStateAction<ITimeRangeOption>>;
}) => {
  const classes = getStyles();
  return (
    <div className={classes.root}>
      {timeRangeOptions.map((timeRangeOption, i: number) => (
        <Fragment key={timeRangeOption.label}>
          {i > 0 && <div className={classes.divider}>{'/'}</div>}
          <div
            className={clsx(
              classes.label,
              timeRangeOption.value === timeRange.value && classes.active
            )}
            onClick={() => setTimeRange(timeRangeOption)}
          >
            {timeRangeOption.label}
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default TimeRangeTabs;
