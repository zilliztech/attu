import { forwardRef, FC } from 'react';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { AlertProps } from '@mui/material/Alert';
import type { CustomSnackBarType } from './Types';

// Forward ref for Alert component
const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
});

const CustomSnackBar: FC<CustomSnackBarType> = props => {
  const {
    vertical = 'top',
    horizontal = 'center',
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
    >
      <Alert
        onClose={handleClose}
        severity={type}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackBar;
