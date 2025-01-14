import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DialogContent,
  DialogActions,
  Theme,
  CircularProgress,
} from '@mui/material';
import CustomDialogTitle from './CustomDialogTitle';
import CustomButton from '../customButton/CustomButton';
import CodeView from '../code/CodeView';
import { makeStyles } from '@mui/styles';
import type { DialogContainerProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    '& form': {
      display: 'flex',
    },
    '& .MuiDialogContent-root': {
      maxHeight: '60vh',
    },
  },
  block: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
  },
  dialog: {
    minWidth: 540,
  },
  codeWrapper: {
    width: (props: { showCode: boolean }) => (props.showCode ? 540 : 0),
    transition: 'width 0.2s',
  },
  code: {
    height: '100%',
    // set code view padding 0 if not show
    padding: (props: { showCode: boolean }) =>
      props.showCode ? theme.spacing(4) : 0,
  },
  actions: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    justifyContent: 'space-between',
    '& .btn': {
      margin: theme.spacing(0.5),
    },
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
  dialogClass = '',
}) => {
  const [confirming, setConfirming] = useState(false);
  const { t } = useTranslation('btn');
  const cancel = cancelLabel || t('cancel');
  const confirm = confirmLabel || t('confirm');
  const classes = useStyles({ showCode });
  const onCancel = handleCancel || handleClose;

  const dialogRef = useRef(null);

  const _handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    setConfirming(true);
    event.preventDefault();
    try {
      await handleConfirm();
    } catch (error) {
    } finally {
      setConfirming(false);
    }
  };

  return (
    <section className={classes.wrapper}>
      <form onSubmit={_handleConfirm}>
        <div
          ref={dialogRef}
          className={`${classes.dialog} ${classes.block} ${dialogClass}`}
        >
          <CustomDialogTitle
            onClose={handleClose}
            showCloseIcon={showCloseIcon}
          >
            {title}
          </CustomDialogTitle>
          <DialogContent>{children}</DialogContent>
          {showActions && (
            <DialogActions className={classes.actions}>
              <div>{leftActions}</div>
              <div>
                {showCancel && (
                  <CustomButton
                    onClick={onCancel}
                    name="cancel"
                    className="btn"
                    disabled={confirming}
                  >
                    {cancel}
                  </CustomButton>
                )}
                <CustomButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={confirming || confirmDisabled}
                  name="confirm"
                  className="btn"
                >
                  {confirming ? <CircularProgress size={16} /> : confirm}
                </CustomButton>
              </div>
            </DialogActions>
          )}
        </div>

        <div className={`${classes.block} ${classes.codeWrapper}`}>
          {showCode && (
            <CodeView wrapperClass={classes.code} data={codeBlocksData} />
          )}
        </div>
      </form>
    </section>
  );
};

export default DialogTemplate;
