import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { makeStyles } from '@mui/styles';
import type { IconButtonProps } from '@mui/material/IconButton';
import type { Theme } from '@mui/material/styles';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'inline-block',
  },
  iconBtn: {
    padding: theme.spacing(0.5),
  },
}));

const CustomIconButton = (props: IconButtonProps & { tooltip?: string }) => {
  const { tooltip, className, ...otherProps } = props;
  const classes = getStyles();

  return (
    <div className={`${classes.wrapper} ${className}`}>
      {tooltip ? (
        <Tooltip title={tooltip} arrow>
          <span>
            <IconButton classes={{ root: classes.iconBtn }} {...otherProps}>
              {props.children}
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <IconButton
          classes={{ root: classes.iconBtn }}
          {...otherProps}
          size="large"
        >
          {props.children}
        </IconButton>
      )}
    </div>
  );
};

export default CustomIconButton;
