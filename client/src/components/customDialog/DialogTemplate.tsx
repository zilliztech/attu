import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogContent,
  DialogActions,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { DialogContainerProps } from './Types';
import CustomDialogTitle from './CustomDialogTitle';
import CustomButton from '../customButton/CustomButton';

const useStyles = makeStyles((theme: Theme) => ({
  actions: {
    paddingTop: theme.spacing(2),
  },
}));

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
  const classes = useStyles();

  return (
    <>
      <CustomDialogTitle onClose={handleCancel}>{title}</CustomDialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions className={classes.actions}>
        <CustomButton onClick={handleCancel} color="default" name="cancel">
          {cancel}
        </CustomButton>
        <CustomButton
          variant="contained"
          onClick={handleConfirm}
          color="primary"
          disabled={confirmDisabled}
          name="confirm"
        >
          {confirm}
        </CustomButton>
      </DialogActions>
    </>
  );
};

export default DialogTemplate;
