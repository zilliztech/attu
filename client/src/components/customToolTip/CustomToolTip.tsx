import Tooltip from '@material-ui/core/Tooltip';
import { CustomToolTipType } from './Types';
import { FC } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tooltip: {
      textTransform: 'capitalize',
    },
  })
);

const CustomToolTip: FC<CustomToolTipType> = props => {
  const classes = useStyles();
  const { title, placement = 'right', children, leaveDelay = 0 } = props;
  return (
    <Tooltip
      classes={{ tooltip: classes.tooltip }}
      leaveDelay={leaveDelay}
      title={title}
      placement={placement}
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default CustomToolTip;
