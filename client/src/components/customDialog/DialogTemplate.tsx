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
import CodeView from '../code/CodeView';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
  },
  block: {
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dialog: {
    minWidth: 480,
  },
  code: {
    height: '100%',
  },
  actions: {
    paddingTop: theme.spacing(2),
    justifyContent: 'space-between',
  },
}));

const DialogTemplate: FC<DialogContainerProps> = ({
  title,
  cancelLabel,
  handleClose,
  handleCancel,
  confirmLabel,
  handleConfirm,
  confirmDisabled,
  children,
  showActions = true,
  showCancel = true,
  showCloseIcon = true,
  leftActions,
  // needed for code mode
  showCode = false,
  codeBlocksData = [],
}) => {
  const { t } = useTranslation('btn');
  const cancel = cancelLabel || t('cancel');
  const confirm = confirmLabel || t('confirm');
  const classes = useStyles();
  const onCancel = handleCancel || handleClose;

  return (
    <section className={classes.wrapper}>
      <div className={`${classes.dialog} ${classes.block}`}>
        <CustomDialogTitle onClose={handleClose} showCloseIcon={showCloseIcon}>
          {title}
        </CustomDialogTitle>
        <DialogContent>{children}</DialogContent>
        {showActions && (
          <DialogActions className={classes.actions}>
            <div>{leftActions}</div>
            <div>
              {showCancel && (
                <CustomButton onClick={onCancel} color="default" name="cancel">
                  {cancel}
                </CustomButton>
              )}
              <CustomButton
                variant="contained"
                onClick={handleConfirm}
                color="primary"
                disabled={confirmDisabled}
                name="confirm"
              >
                {confirm}
              </CustomButton>
            </div>
          </DialogActions>
        )}
      </div>
      <div className={classes.block}>
        {showCode && <CodeView wrapperClass={classes.code} />}
      </div>
    </section>
  );
};

export default DialogTemplate;
