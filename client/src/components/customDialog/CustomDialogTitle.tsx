import {
  DialogTitleProps,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import icons from '../icons/Icons';
import { theme } from '../../styles/theme';

const getStyles = makeStyles(() => ({
  root: {
    margin: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 500,
    wordBreak: 'break-all',
    maxWidth: 500
  },
  icon: {
    fontSize: '24px',
    color: theme.palette.attuDark.main,
    cursor: 'pointer',
  },
}));

interface IProps extends DialogTitleProps {
  onClose?: () => void;
  showCloseIcon?: boolean;
}

const CustomDialogTitle = (props: IProps) => {
  const {
    children,
    classes = { root: '' },
    onClose,
    showCloseIcon = true,
    ...other
  } = props;
  const innerClass = getStyles();

  const ClearIcon = icons.clear;

  return (
    <MuiDialogTitle
      disableTypography
      className={`${innerClass.root} ${classes.root}`}
      {...other}
    >
      <Typography variant="h4" className={innerClass.title}>
        {children}
      </Typography>
      {showCloseIcon && onClose ? (
        <ClearIcon
          data-testid="clear-icon"
          classes={{ root: innerClass.icon }}
          onClick={onClose}
        />
      ) : null}
    </MuiDialogTitle>
  );
};

export default CustomDialogTitle;
