import { forwardRef, FC, SyntheticEvent } from 'react';
import { CustomSnackBarType } from './Types';
import MuiAlert from '@material-ui/lab/Alert';
import { Snackbar, makeStyles, Theme, createStyles } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions/transition';

// if we need to use slide component
// snackbar content must use forwardRef to wrapper it
const Alert = forwardRef((props: { [x: string]: any }, ref) => {
  return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
});

function SlideTransition(props: TransitionProps) {
  return <Slide {...props} direction="left" />;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      borderRadius: '4px',
      maxWidth: '300px',
    },
    topRight: {
      [theme.breakpoints.up('md')]: {
        top: '72px',
        right: theme.spacing(4),
      },
      top: '72px',
      right: theme.spacing(4),
    },
  })
);

const CustomSnackBar: FC<CustomSnackBarType> = props => {
  const {
    vertical,
    horizontal,
    open,
    autoHideDuration = 2000,
    type,
    message,
    onClose,
  } = props;
  const classes = useStyles();
  const handleClose = (e: SyntheticEvent<any, Event>, reason: string) => {
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
