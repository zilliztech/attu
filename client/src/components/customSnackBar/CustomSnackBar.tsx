import { forwardRef, FC } from 'react';
import MuiAlert from '@mui/material/Alert';
import Icons from '@/components/icons/Icons';
import Snackbar from '@mui/material/Snackbar';
import type { AlertProps } from '@mui/material/Alert';
import type { CustomSnackBarType } from './Types';

// Forward ref for Alert component
const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert ref={ref} elevation={0} variant="filled" {...props} />;
});

const CustomSnackBar: FC<CustomSnackBarType> = props => {
  const {
    vertical = 'top',
    horizontal = 'center',
    open,
    autoHideDuration = 3000,
    type,
    message,
    onClose,
  } = props;

  return (
    <Snackbar
      anchorOrigin={{ vertical, horizontal }}
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
    >
      <Alert
        onClose={onClose}
        severity={type}
        iconMapping={{
          error: <Icons.error />,
          info: <Icons.info />,
          success: <Icons.check />,
          warning: <Icons.cross />,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackBar;
