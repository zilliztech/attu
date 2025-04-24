import Tooltip from '@mui/material/Tooltip';
import { FC } from 'react';
import type { CustomToolTipType } from './Types';

const CustomToolTip: FC<CustomToolTipType> = props => {
  const { title, placement = 'right', children, leaveDelay = 0, sx } = props;
  return (
    <Tooltip
      leaveDelay={leaveDelay}
      title={title}
      placement={placement}
      arrow
      sx={sx}
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default CustomToolTip;