import { IconButtonProps, Tooltip, IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

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
            <IconButton
              classes={{ root: classes.iconBtn }}
              {...otherProps}
              size="large"
            >
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
