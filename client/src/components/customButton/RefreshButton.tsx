import { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { MouseEvent, ReactNode } from 'react';
import type { IconButtonProps } from '@mui/material';

interface RefreshButtonProps extends Omit<IconButtonProps, 'onClick'> {
  tooltip?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  icon?: ReactNode;
}

const RefreshButton = ({
  onClick,
  tooltip,
  tooltipPlacement = 'top',
  icon,
  ...otherProps
}: RefreshButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onBtnClicked = async (event: MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    try {
      if (onClick) {
        await onClick(event);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const button = (
    <IconButton
      size="small"
      onClick={onBtnClicked}
      disabled={isLoading}
      sx={{
        '& svg': {
          width: 16,
          height: 16,
        },
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...otherProps.sx,
      }}
      {...otherProps}
    >
      {isLoading ? <CircularProgress size={16} /> : icon || <RefreshIcon />}
    </IconButton>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow placement={tooltipPlacement}>
      <span>{button}</span>
    </Tooltip>
  ) : (
    button
  );
};

export default RefreshButton;
