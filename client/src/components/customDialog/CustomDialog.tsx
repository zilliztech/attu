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
      minWidth: 480,
      borderRadius: 8,
      padding: 0,

      backgroundColor: 'transparent',
    },
    noticePaper: {
      backgroundColor: '#fff',
      maxWidth: 480,
    },
    paperSm: {
      maxWidth: '80%',
    },
    dialogContent: {
      marginTop: theme.spacing(2),
    },
    title: {
      '& p': {
        fontWeight: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 300,
        fontSize: 20,
      },
    },
    padding: {
      padding: theme.spacing(3, 4, 4),
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
          <DialogActions classes={{ spacing: classes.padding }}>
            <CustomButton
              onClick={() => handleCancel()}
              className={classes.cancel}
              color="default"
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
