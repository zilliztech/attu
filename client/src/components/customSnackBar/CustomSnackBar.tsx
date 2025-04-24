import { forwardRef, FC } from 'react';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import type { AlertProps } from '@mui/material/Alert';
import type { SlideProps } from '@mui/material/Slide';
import type { CustomSnackBarType } from './Types';

// Forward ref for Alert component
const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
});

// SlideTransition component
const SlideTransition: FC<SlideProps> = props => {
  return <Slide {...props} direction="left" />;
};

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

  const handleClose = (event: React.SyntheticEvent<any> | Event) => {
    onClose && onClose();
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: vertical,
        horizontal: horizontal,
      }}
      key={`${vertical}${horizontal}`}
      open={open}
      onClose={handleClose}
      autoHideDuration={autoHideDuration}
      TransitionComponent={SlideTransition}
      sx={{
        '&.MuiSnackbar-anchorOriginTopRight': {
          top: { xs: 56, md: 72 },
          right: theme => theme.spacing(4),
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        sx={{
          maxWidth: '50vh',
          wordBreak: 'break-all',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackBar;
