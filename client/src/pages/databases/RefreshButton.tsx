import { useState, MouseEvent } from 'react';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';

import { IconButtonProps, makeStyles, Theme } from '@material-ui/core';
import icons from '@/components/icons/Icons';

const useStyles = makeStyles((theme: Theme) => ({
  rotatingRefreshButton: {
    ' & svg': {
      color: theme.palette.primary.main,
    },
    marginLeft: 4,
  },
}));

const RefreshButton = (props: IconButtonProps & { tooltip?: string }) => {
  // props
  const { onClick, ...otherProps } = props;
  // UI states
  const [isLoading, setIsLoading] = useState(false);

  // icon
  const RefreshIcon = icons.refresh;
  const classes = useStyles();

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
      className={classes.rotatingRefreshButton}
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
