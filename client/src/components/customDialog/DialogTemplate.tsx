import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, DialogActions } from '@material-ui/core';
import { DialogContainerProps } from './Types';
import CustomDialogTitle from './CustomDialogTitle';
import CustomButton from '../customButton/CustomButton';

const DialogTemplate: FC<DialogContainerProps> = ({
  title,
  cancelLabel,
  handleCancel,
  confirmLabel,
  handleConfirm,
  confirmDisabled,
  children,
}) => {
  const { t } = useTranslation('btn');
  const cancel = cancelLabel || t('cancel');
  const confirm = confirmLabel || t('confirm');

  return (
    <>
      <CustomDialogTitle onClose={handleCancel}>{title}</CustomDialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <CustomButton onClick={handleCancel} color="default">
          {cancel}
        </CustomButton>
        <CustomButton
          variant="contained"
          onClick={handleConfirm}
          color="primary"
          disabled={confirmDisabled}
        >
          {confirm}
        </CustomButton>
      </DialogActions>
    </>
  );
};

export default DialogTemplate;
