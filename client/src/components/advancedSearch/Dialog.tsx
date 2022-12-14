import React, { useEffect } from 'react';
import {
  makeStyles,
  Theme,
  createStyles,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CachedIcon from '@material-ui/icons/Cached';
import ConditionGroup from './ConditionGroup';
import CopyBtn from './CopyButton';
// import DialogTemplate from '../customDialog/DialogTemplate';
import { DialogProps } from './Types';

const AdvancedDialog = (props: DialogProps) => {
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
    title = 'Advanced Filter',
    fields = [],
    ...others
  } = props;
  const { addCondition } = handleConditions;
  const classes = useStyles();

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
        <DialogTitle className={classes.dialogTitle} disableTypography>
          <Typography variant="h5" component="h2">
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
          <Button
            onClick={onReset}
            color="primary"
            className={classes.resetBtn}
            size="small"
          >
            <CachedIcon />
            Reset
          </Button>
          <div>
            <Button
              autoFocus
              onClick={onCancel}
              color="primary"
              className={classes.cancelBtn}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              variant="contained"
              color="primary"
              className={classes.applyBtn}
              disabled={!isLegal}
            >
              Apply Filters
            </Button>
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
      marginRight: '32px',
    },
    applyBtn: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    copyButton: {
      borderRadius: '0',
    },
    expResult: {
      background: '#F9F9F9',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '40px',
      margin: '8px 32px',
      padding: '0 16px',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '16px',
      lineHeight: '24px',
    },
    expWrapper: {
      background: '#F9F9F9',
      borderRadius: '8px',
      minWidth: '480px',
      minHeight: '104px',
      padding: '12px',
    },
  })
);

export default AdvancedDialog;
