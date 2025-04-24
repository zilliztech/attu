import { useState } from 'react';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import icons from '@/components/icons/Icons';
import type { MouseEvent } from 'react';
import type { IconButtonProps } from '@mui/material';

interface RefreshButtonProps extends IconButtonProps {
  tooltip?: string;
  icon?: React.ReactNode;
}

const RefreshButton = ({
  onClick,
  icon,
  className,
  ...otherProps
}: RefreshButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const RefreshIcon = icons.refresh;

  const onBtnClicked = async (event: MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    if (onClick) {
      await onClick(event);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <span className={className} style={{ display: 'flex', width: 23 }}>
        <StatusIcon type={LoadingType.CREATING} />
      </span>
    );
  }

  return (
    <CustomIconButton
      className={className}
      {...otherProps}
      onClick={onBtnClicked}
      disabled={isLoading}
    >
      {icon ?? <RefreshIcon />}
    </CustomIconButton>
  );
};

export default RefreshButton;
