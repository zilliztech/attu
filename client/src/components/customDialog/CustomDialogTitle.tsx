import Typography from '@mui/material/Typography';
import MuiDialogTitle from '@mui/material/DialogTitle';
import icons from '../icons/Icons';
import type { DialogTitleProps } from '@mui/material/DialogTitle';

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
    sx,
    ...other
  } = props;

  return (
    <MuiDialogTitle
      className={classes.root}
      {...other}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1,
        pt: 4,
        ...sx,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          wordBreak: 'break-all',
          fontSize: '20px',
        }}
      >
        {children}
      </Typography>
      {showCloseIcon && onClose ? (
        <icons.clear
          data-testid="clear-icon"
          onClick={onClose}
          sx={{
            fontSize: '18px',
            cursor: 'pointer',
          }}
        />
      ) : null}
    </MuiDialogTitle>
  );
};

export default CustomDialogTitle;
