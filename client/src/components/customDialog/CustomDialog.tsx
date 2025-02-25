import { FC } from 'react';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import CustomButton from '../customButton/CustomButton';
import CustomDialogTitle from './CustomDialogTitle';
import { makeStyles } from '@mui/styles';
import type { Theme } from '@mui/material/styles';
import type { CustomDialogType } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    border: `1px solid ${theme.palette.divider}`,
  },
  noticePaper: {},
  paperSm: {
    maxWidth: '80%',
  },
  dialogContent: {
    // marginTop: theme.spacing(2),
  },
  title: {},
  cancel: {
    // color: theme.palette.common.black,
    // opacity: 0.4,
  },
}));

const CustomDialog: FC<CustomDialogType> = props => {
  const { t } = useTranslation('btn');
  const classes = useStyles();
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
  } = params; // for notice type
  const { component: CustomComponent } = params; // for custom type
  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    if (confirm) {
      const res = await confirm();
      if (!res) {
        return;
      }
    }
    handleClose ? handleClose() : onClose();
    event.preventDefault();
  };

  const handleCancel = async () => {
    if (cancel) {
      const res = await cancel();
      if (!res) {
        return;
      }
    }
    handleClose ? handleClose() : onClose();
  };

  return (
    <Dialog
      classes={{
        paper: `${classes.paper} ${
          type === 'notice' ? classes.noticePaper : ''
        }`,
        paperWidthSm: type === 'notice' ? '' : classes.paperSm,
        container: `${containerClass}`,
      }}
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleCancel();
        }
      }}
    >
      {type === 'notice' ? (
        <form onSubmit={handleConfirm}>
          <CustomDialogTitle
            classes={{ root: classes.title }}
            onClose={handleCancel}
          >
            <Typography variant="body1">{title}</Typography>
          </CustomDialogTitle>
          {component && (
            <DialogContent classes={{ root: classes.dialogContent }}>
              {component}
            </DialogContent>
          )}
          <DialogActions>
            <CustomButton
              onClick={() => handleCancel()}
              className={classes.cancel}
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
