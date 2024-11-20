import { useState, MouseEvent } from 'react';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { IconButtonProps } from '@mui/material';
import icons from '@/components/icons/Icons';

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
