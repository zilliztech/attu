import { FC } from 'react';
import {
  DialogActions,
  DialogContent,
  Dialog,
  makeStyles,
  Theme,
  createStyles,
  Typography,
} from '@material-ui/core';
import { CustomDialogType } from './Types';
import { useTranslation } from 'react-i18next';
import CustomButton from '../customButton/CustomButton';
import CustomDialogTitle from './CustomDialogTitle';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // maxWidth: '480px',
      minWidth: '480px',
      // width: '100%',
      borderRadius: '8px',
      padding: 0,
    },
    title: {
      // padding: theme.spacing(4),
      '& p': {
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '300px',
        fontSize: '20px',
      },
    },
    padding: {
      padding: theme.spacing(4),
    },
    cancel: {
      color: theme.palette.common.black,
      opacity: 0.4,
    },
  })
);

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
  const handleConfirm = async () => {
    if (confirm) {
      const res = await confirm();
      if (!res) {
        return;
      }
    }
    handleClose ? handleClose() : onClose();
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
      classes={{ paper: classes.paper, container: `${containerClass}` }}
      open={open}
      onClose={handleCancel}
    >
      {type === 'notice' ? (
        <>
          <CustomDialogTitle
            classes={{ root: classes.title }}
            onClose={handleCancel}
          >
            <Typography variant="body1">{title}</Typography>
          </CustomDialogTitle>
          {component && <DialogContent>{component}</DialogContent>}
          <DialogActions classes={{ spacing: classes.padding }}>
            <CustomButton
              onClick={() => handleCancel()}
              className={classes.cancel}
              color="default"
            >
              {cancelLabel}
            </CustomButton>
            <CustomButton
              onClick={() => handleConfirm()}
              color="primary"
              variant="contained"
              className={confirmClass}
            >
              {confirmLabel}
            </CustomButton>
          </DialogActions>
        </>
      ) : (
        CustomComponent
      )}
    </Dialog>
  );
};

export default CustomDialog;
