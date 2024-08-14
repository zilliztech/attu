import { forwardRef, FC } from 'react';
import { CustomSnackBarType } from './Types';
import MuiAlert from '@mui/material/Alert';
import {
  Snackbar,
  Theme,
  Slide,
  SnackbarCloseReason,
  AlertProps,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions/transition';
import { makeStyles } from '@mui/styles';

// if we need to use slide component
// snackbar content must use forwardRef to wrapper it
const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (props: { [x: string]: any }, ref) => {
    return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
  }
);

function SlideTransition(props: TransitionProps) {
  return <Slide {...props} direction="left" />;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: '50vh',
    wordBreak: 'break-all',
  },
  topRight: {
    [theme.breakpoints.up('md')]: {
      top: '72px',
      right: theme.spacing(4),
    },
    top: '72px',
    right: theme.spacing(4),
  },
}));

const CustomSnackBar: FC<CustomSnackBarType> = props => {
  const {
    vertical,
    horizontal,
    open,
    autoHideDuration = 2500,
    type,
    message,
    onClose,
  } = props;
  const classes = useStyles();
  const handleClose = (
    event: React.SyntheticEvent<any> | Event,
    reason: SnackbarCloseReason
  ) => {
    // only click x to close or auto hide.
    if (reason === 'clickaway') {
      return;
    }
    onClose && onClose();
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: vertical,
          horizontal: horizontal,
        }}
        key={`${vertical}${horizontal}`}
        open={open}
        onClose={handleClose}
        autoHideDuration={autoHideDuration}
        classes={{
          anchorOriginTopRight: classes.topRight,
        }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleClose}
          severity={type}
          classes={{ root: classes.root }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CustomSnackBar;
