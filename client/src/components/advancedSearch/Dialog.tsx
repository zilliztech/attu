import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
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

interface DialogProps {
  others?: object;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onReset: () => void;
  onCancel: () => void;
  title: string;
  fields: Field[];
  handleConditions: any;
  conditions: any[];
  isLegal: boolean;
  expression: string;
}

interface Field {
  name: string;
  type: 'int' | 'float';
}

const AdvancedDialog = React.forwardRef((props: DialogProps, ref) => {
  const {
    open,
    onClose,
    onSubmit,
    onReset,
    onCancel,
    handleConditions,
    conditions: flatConditions,
    isLegal,
    expression: filterExpression,
    title,
    fields,
    ...others
  } = props;
  const { addCondition } = handleConditions;
  const classes = useStyles();

  useEffect(() => {
    flatConditions.length === 0 && addCondition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const childRef: any = useRef();

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
        <DialogContent>
          <div
            className={`${classes.expResult} ${
              !isLegal && 'disable-exp'
            } testcopy`}
          >
            {`${isLegal ? filterExpression : 'Filter Expression'}`}
            {isLegal && (<CopyBtn label="copy expression" value={filterExpression} />)}
          </div>
          <div className={classes.expWrapper}>
            <ConditionGroup
              // ref={childRef}
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
    </>
  );
});

AdvancedDialog.propTypes = {
  others: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  handleConditions: PropTypes.object.isRequired,
  conditions: PropTypes.array.isRequired,
  isLegal: PropTypes.bool.isRequired,
  expression: PropTypes.string.isRequired,
};

AdvancedDialog.defaultProps = {
  open: false,
  onClose: () => {},
  onSubmit: () => {},
  title: 'Advanced Filter',
  fields: [],
  onReset: () => {},
  onCancel: () => {},
  handleConditions: {},
  conditions: [],
  isLegal: false,
  expression: '',
};

AdvancedDialog.displayName = 'AdvancedDialog';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    wrapper: {
      '& .disable-exp': {
        userSelect: 'none',
        color: '#AEAEBB',
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
      backgroundColor: '#06AFF2',
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
      marginBottom: '16px',
      padding: '0 16px',
      fontFamily: 'Source Code Pro',
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
