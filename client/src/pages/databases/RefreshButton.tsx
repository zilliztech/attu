import { useState, MouseEvent } from 'react';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { IconButtonProps } from '@mui/material';
import icons from '@/components/icons/Icons';

const RefreshButton = (props: IconButtonProps & { tooltip?: string }) => {
  // props
  const { onClick, ...otherProps } = props;
  // UI states
  const [isLoading, setIsLoading] = useState(false);

  // icon
  const RefreshIcon = icons.refresh;

  const onBtnClicked = async (event: MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    onClick && (await onClick(event));
    setIsLoading(false);
  };

  if (isLoading) {
    return <StatusIcon type={LoadingType.CREATING} size={20} />;
  }

  return (
    <CustomIconButton
      className={props.className}
      {...otherProps}
      onClick={onBtnClicked}
      style={{}}
      disabled={isLoading}
    >
      <RefreshIcon />
    </CustomIconButton>
  );
};

export default RefreshButton;
