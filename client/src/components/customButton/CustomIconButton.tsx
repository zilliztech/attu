import { IconButtonProps, Tooltip, IconButton } from '@material-ui/core';

const CustomIconButton = (props: IconButtonProps & { tooltip?: string }) => {
  const { tooltip, ...otherProps } = props;

  return (
    <>
      {tooltip ? (
        <Tooltip title={tooltip} arrow>
          <span>
            <IconButton {...otherProps}>{props.children}</IconButton>
          </span>
        </Tooltip>
      ) : (
        <IconButton {...otherProps}>{props.children}</IconButton>
      )}
    </>
  );
};

export default CustomIconButton;
