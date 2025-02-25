import { forwardRef, FC } from 'react';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import { makeStyles } from '@mui/styles';
import type { Theme } from '@mui/material/styles';
import type { AlertProps } from '@mui/material/Alert';
import type { SlideProps } from '@mui/material/Slide';
import type { CustomSnackBarType } from './Types';

// if we need to use slide component
// snackbar content must use forwardRef to wrapper it
const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (props: { [x: string]: any }, ref) => {
    return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
  }
);

interface SlideTransitionProps extends SlideProps {
  direction?: 'left' | 'right' | 'up' | 'down';
}

const SlideTransition: React.FC<SlideTransitionProps> = props => {
  return <Slide {...props} direction="left" />;
};

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
  const handleClose = (event: React.SyntheticEvent<any> | Event) => {
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
