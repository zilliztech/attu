import { FC } from 'react';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import CustomButton from '../customButton/CustomButton';
import CustomDialogTitle from './CustomDialogTitle';
import type { CustomDialogType } from './Types';

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
    component: CustomComponent,
  } = params;

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    if (confirm) {
      const res = await confirm();
      if (!res) return;
    }
    (handleClose || onClose)();
    event.preventDefault();
  };

  const handleCancel = async () => {
    if (cancel) {
      const res = await cancel();
      if (!res) return;
    }
    (handleClose || onClose)();
  };

  return (
    <Dialog
      className={containerClass}
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') handleCancel();
      }}
      sx={{
        '& .MuiDialog-paper': {
          border: theme => `1px solid ${theme.palette.divider}`,
          ...(type !== 'notice' && { maxWidth: '80%' }),
        },
      }}
    >
      {type === 'notice' ? (
        <form onSubmit={handleConfirm}>
          <CustomDialogTitle onClose={handleCancel}>
            <Typography variant="body1">{title}</Typography>
          </CustomDialogTitle>
          {component && <DialogContent>{component}</DialogContent>}
          <DialogActions>
            <CustomButton
              onClick={handleCancel}
              sx={{ color: theme => theme.palette.text.secondary }}
            >
              {cancelLabel}
            </CustomButton>
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
    </Dialog>
  );
};

export default CustomDialog;
