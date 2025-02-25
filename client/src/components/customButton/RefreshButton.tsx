import { useState } from 'react';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import icons from '@/components/icons/Icons';
import type { MouseEvent } from 'react';
import type { IconButtonProps } from '@mui/material';

const RefreshButton = (
  props: IconButtonProps & {
    tooltip?: string;
    icon?: React.ReactNode;
  }
) => {
  // props
  const { onClick, icon, ...otherProps } = props;
  // UI states
  const [isLoading, setIsLoading] = useState(false);

  // icon
  const RefreshIcon = icons.refresh;

  const onBtnClicked = async (event: MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    onClick && (await onClick(event));
    setIsLoading(false);
  };

  const styleObj = {
    display: 'flex',
    width: '23px',
  };

  if (isLoading) {
    return (
      <div className={props.className} style={styleObj}>
        <StatusIcon type={LoadingType.CREATING} />
      </div>
    );
  }

  return (
    <CustomIconButton
      className={props.className}
      {...otherProps}
      onClick={onBtnClicked}
      disabled={isLoading}
    >
      {icon ? icon : <RefreshIcon />}
    </CustomIconButton>
  );
};

export default RefreshButton;
