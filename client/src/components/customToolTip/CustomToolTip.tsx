import Tooltip from '@mui/material/Tooltip';
import { FC } from 'react';
import { makeStyles } from '@mui/styles';
import type { Theme } from '@mui/material/styles';
import type { CustomToolTipType } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {},
}));

const CustomToolTip: FC<CustomToolTipType> = props => {
  const classes = useStyles();
  const { title, placement = 'right', children, leaveDelay = 0 } = props;
  return (
    <Tooltip
      classes={{ tooltip: classes.tooltip }}
      leaveDelay={leaveDelay}
      title={title}
      placement={placement}
      arrow
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default CustomToolTip;
