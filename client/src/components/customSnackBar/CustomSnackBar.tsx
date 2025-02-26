import { forwardRef, FC } from 'react';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import { styled } from '@mui/material/styles';
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

// Styled components
const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  '&.MuiSnackbar-anchorOriginTopRight': {
    [theme.breakpoints.up('md')]: {
      top: '72px',
      right: theme.spacing(4),
    },
    top: '72px',
    right: theme.spacing(4),
  },
}));

const StyledAlert = styled(Alert)({
  maxWidth: '50vh',
  wordBreak: 'break-all',
});

// CustomSnackBar component
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
    <div>
      <StyledSnackbar
        anchorOrigin={{
          vertical: vertical,
          horizontal: horizontal,
        }}
        key={`${vertical}${horizontal}`}
        open={open}
        onClose={handleClose}
        autoHideDuration={autoHideDuration}
        TransitionComponent={SlideTransition}
      >
        <StyledAlert onClose={handleClose} severity={type}>
          {message}
        </StyledAlert>
      </StyledSnackbar>
    </div>
  );
};

export default CustomSnackBar;
