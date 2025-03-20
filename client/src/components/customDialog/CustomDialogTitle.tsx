import Typography from '@mui/material/Typography';
import MuiDialogTitle from '@mui/material/DialogTitle';
import icons from '../icons/Icons';
import { styled } from '@mui/material/styles';
import type { DialogTitleProps } from '@mui/material/DialogTitle';

const StyledDialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  paddingTop: theme.spacing(4),
}));

const TitleText = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  wordBreak: 'break-all',
  fontSize: '20px',
}));

const CloseIcon = styled(icons.clear)(({ theme }) => ({
  fontSize: '18px',
  color: theme.palette.text.primary,
  cursor: 'pointer',
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

  return (
    <StyledDialogTitle className={classes.root} {...other}>
      <TitleText variant="body2">{children}</TitleText>
      {showCloseIcon && onClose ? (
        <CloseIcon data-testid="clear-icon" onClick={onClose} />
      ) : null}
    </StyledDialogTitle>
  );
};

export default CustomDialogTitle;