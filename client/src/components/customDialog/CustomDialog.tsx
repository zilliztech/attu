import { FC } from 'react';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import CustomButton from '../customButton/CustomButton';
import CustomDialogTitle from './CustomDialogTitle';
import type { CustomDialogType } from './Types';

const StyledDialog = styled(Dialog, {
  shouldForwardProp: prop =>
    !['type', 'containerClass'].includes(prop as string),
})<{ type?: 'notice' | 'custom'; containerClass?: string }>(
  ({ theme, type, containerClass }) => ({
    '& .MuiDialog-paper': {
      border: `1px solid ${theme.palette.divider}`,
      ...(type !== 'notice' && { maxWidth: '80%' }),
    },
    ...(containerClass && { container: containerClass }),
  })
);

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  /* If needed, add dialog content styles here */
}));

const StyledCancelButton = styled(CustomButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const CustomDialog: FC<CustomDialogType> = props => {
  const { t } = useTranslation('btn');
  const { open, type, params, onClose, containerClass = '' } = props;
  const {
    title,
    component,
    confirm,
    confirmLabel = t('confirm'),
    cancel,
    cancelLabel = t('cancel'),
    confirmClass = '',
    handleClose,
  } = params;
  const { component: CustomComponent } = params;

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    if (confirm) {
      const res = await confirm();
      if (!res) return;
    }
    handleClose ? handleClose() : onClose();
    event.preventDefault();
  };

  const handleCancel = async () => {
    if (cancel) {
      const res = await cancel();
      if (!res) return;
    }
    handleClose ? handleClose() : onClose();
  };

  return (
    <StyledDialog
      type={type}
      containerClass={containerClass}
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') handleCancel();
      }}
    >
      {type === 'notice' ? (
        <form onSubmit={handleConfirm}>
          <CustomDialogTitle onClose={handleCancel}>
            <Typography variant="body1">{title}</Typography>
          </CustomDialogTitle>
          {component && <StyledDialogContent>{component}</StyledDialogContent>}
          <DialogActions>
            <StyledCancelButton onClick={handleCancel}>
              {cancelLabel}
            </StyledCancelButton>
            <CustomButton
              type="submit"
              color="primary"
              variant="contained"
              className={confirmClass}
            >
              {confirmLabel}
            </CustomButton>
          </DialogActions>
        </form>
      ) : (
        CustomComponent
      )}
    </StyledDialog>
  );
};

export default CustomDialog;
