import { DialogTitleProps, Typography, Theme } from '@mui/material';
import MuiDialogTitle from '@mui/material/DialogTitle';
import icons from '../icons/Icons';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 32,
  },
  title: {
    fontWeight: 500,
    wordBreak: 'break-all',
    fontSize: '20px',
  },
  icon: {
    fontSize: '18px',
    color: theme.palette.text.primary,
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
    <MuiDialogTitle className={`${innerClass.root} ${classes.root}`} {...other}>
      <Typography variant="body2" className={innerClass.title}>
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
