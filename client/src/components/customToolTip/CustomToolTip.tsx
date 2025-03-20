import Tooltip from '@mui/material/Tooltip';
import { FC } from 'react';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { CustomToolTipType } from './Types';

const StyledTooltip = styled(Tooltip)(({ theme }: { theme: Theme }) => ({
  // You can add custom styles here if needed
}));

const CustomToolTip: FC<CustomToolTipType> = props => {
  const { title, placement = 'right', children, leaveDelay = 0 } = props;
  return (
    <StyledTooltip
      leaveDelay={leaveDelay}
      title={title}
      placement={placement}
      arrow
    >
      <span>{children}</span>
    </StyledTooltip>
  );
};

export default CustomToolTip;
