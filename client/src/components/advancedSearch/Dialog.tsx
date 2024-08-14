import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Theme,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomButton from '../customButton/CustomButton';
import ConditionGroup from './ConditionGroup';
import icons from '../icons/Icons';
import CopyBtn from './CopyButton';
// import DialogTemplate from '../customDialog/DialogTemplate';
import { DialogProps } from './Types';

const AdvancedDialog = (props: DialogProps) => {
  // i18n
  const { t: searchTrans } = useTranslation('search');
  const { t: btnTrans } = useTranslation('btn');

  const {
    open = false,
    onClose,
    onSubmit,
    onReset,
    onCancel,
    handleConditions = {},
    conditions: flatConditions = [],
    isLegal = false,
    expression: filterExpression = '',
    title = searchTrans('advancedFilter'),
    fields = [],
    ...others
  } = props;
  const { addCondition } = handleConditions;
  const classes = useStyles();
  const ResetIcon = icons.refresh;
  const CloseIcon = icons.clear;

  useEffect(() => {
    flatConditions.length === 0 && addCondition();
    // Only need add one condition after dialog's first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shouldSowPlaceholder: boolean = !isLegal || !filterExpression;

  return (
    <>
      <Dialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="xl"
        className={classes.wrapper}
        {...others}
      >
        <DialogTitle className={classes.dialogTitle}>
          <Typography variant="h5" component="div">
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onCancel}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <div
          className={`${classes.expResult} ${
            shouldSowPlaceholder && 'disable-exp'
          }`}
        >
          {`${shouldSowPlaceholder ? 'Filter Expression' : filterExpression}`}
          {!shouldSowPlaceholder && (
            <CopyBtn label="copy expression" value={filterExpression} />
          )}
        </div>
        <DialogContent>
          <div className={classes.expWrapper}>
            <ConditionGroup
              fields={fields}
              handleConditions={handleConditions}
              conditions={flatConditions}
            />
          </div>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <CustomButton
            onClick={onReset}
            color="primary"
            className={classes.resetBtn}
            size="small"
            startIcon={<ResetIcon />}
          >
            <Typography variant="button"> {btnTrans('reset')}</Typography>
          </CustomButton>
          <div>
            <CustomButton
              autoFocus
              onClick={onCancel}
              color="primary"
              className={classes.cancelBtn}
            >
              <Typography variant="button"> {btnTrans('cancel')}</Typography>
            </CustomButton>

            <CustomButton
              onClick={onSubmit}
              variant="contained"
              color="primary"
              className={classes.applyBtn}
              disabled={!isLegal}
            >
              {btnTrans('applyFilter')}
            </CustomButton>
          </div>
        </DialogActions>
      </Dialog>
      {/* <DialogTemplate
      title={title}
      handleClose={onClose}
      showCloseIcon
      handleConfirm={onSubmit}
      confirmLabel="Apply Filters"
      confirmDisabled={!isLegal}
      handleCancel={onCancel}
      cancelLabel="Cancel"
      leftActions={
        <Button
          onClick={onReset}
          color="primary"
          className={classes.resetBtn}
          size="small"
        >
          <CachedIcon />
          Reset
        </Button>
      }
    >
      <div
        className={`${classes.expResult} ${
          !isLegal && 'disable-exp'
        } testcopy`}
      >
        {`${isLegal ? filterExpression : 'Filter Expression'}`}
        {isLegal && (
          <CopyBtn label="copy expression" value={filterExpression} />
        )}
      </div>
      <div className={classes.expWrapper}>
        <ConditionGroup
          fields={fields}
          handleConditions={handleConditions}
          conditions={flatConditions}
        />
      </div>
    </DialogTemplate> */}
    </>
  );
};

AdvancedDialog.displayName = 'AdvancedDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  wrapper: {
    '& .disable-exp': {
      userSelect: 'none',
      color: theme.palette.attuGrey.main,
    },
  },
  closeButton: {
    color: 'black',
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogActions: {
    justifyContent: 'space-between',
  },
  resetBtn: {},
  cancelBtn: {
    marginRight: theme.spacing(1),
  },
  applyBtn: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  copyButton: {},
  expResult: {
    background: '#f4f4f4',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '40px',
    margin: theme.spacing(1, 4),
    padding: theme.spacing(0, 2),
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '16px',
    lineHeight: '24px',
  },
  expWrapper: {
    background: '#f4f4f4',
    minWidth: '480px',
    minHeight: '104px',
    padding: theme.spacing(1.5),
  },
}));

export default AdvancedDialog;
