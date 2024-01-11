import {
  DialogActions,
  DialogContent,
  makeStyles,
  TextField,
  Theme,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { ChangeEvent, FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/customButton/CustomButton';
import CustomDialogTitle from '@/components/customDialog/CustomDialogTitle';
import { DeleteDialogContentType } from '@/components/customDialog/Types';
import { rootContext } from '@/context';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: '480px',
    backgroundColor: '#fff',
  },
  info: {
    marginBottom: theme.spacing(0.5),
  },
  mb: {
    marginBottom: theme.spacing(2.5),
  },
  btnWrapper: {
    display: 'flex',
  },
  label: {
    display: 'none',
  },
  btnLabel: {
    fontWeight: 'bold',
  },
  input: {
    padding: '10px 12px',
  },
  cancelBtn: {
    color: theme.palette.attuGrey.dark,
  },
  checkBox: {},
}));

const DeleteTemplate: FC<DeleteDialogContentType> = props => {
  const {
    title,
    text,
    label,
    compare,
    handleDelete,
    handleCancel,
    forceDelLabel,
  } = props;
  const { handleCloseDialog } = useContext(rootContext);
  const classes = useStyles();
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');

  const [value, setValue] = useState<string>('');
  const [force, setForce] = useState<boolean>(false);
  const [deleteReady, setDeleteReady] = useState<boolean>(false);

  const onCancelClick = () => {
    handleCloseDialog();
    handleCancel && handleCancel();
  };

  const onDeleteClick = (event: React.FormEvent<HTMLFormElement>) => {
    handleDelete(force);
    event.preventDefault();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);

    setDeleteReady(value.toLowerCase() === (compare || label).toLowerCase());
  };

  return (
    <div className={classes.root}>
      <form onSubmit={onDeleteClick}>
        <CustomDialogTitle
          classes={{ root: classes.mb }}
          onClose={onCancelClick}
        >
          {title}
        </CustomDialogTitle>

        <DialogContent>
          <Typography variant="body1" className={classes.info}>{text}</Typography>
          <Typography variant="body1" className={classes.mb}>
            {dialogTrans('deleteTipAction')}
            <strong className={classes.btnLabel}>{` ${(
              compare || label
            ).toLowerCase()} `}</strong>
            {dialogTrans('deleteTipPurpose')}
          </Typography>
          <TextField
            value={value}
            onChange={onChange}
            InputLabelProps={{
              classes: {
                root: classes.label,
              },
            }}
            InputProps={{
              classes: {
                input: classes.input,
              },
            }}
            variant="filled"
            fullWidth={true}
          />
          {forceDelLabel ? (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean
                  ) => {
                    setForce(checked);
                  }}
                />
              }
              key={'force'}
              label={forceDelLabel}
              value={true}
              checked={force}
              className={classes.checkBox}
            />
          ) : null}
        </DialogContent>

        <DialogActions className={classes.btnWrapper}>
          <CustomButton
            name="cancel"
            onClick={onCancelClick}
            className={classes.cancelBtn}
          >
            {btnTrans('cancel')}
          </CustomButton>
          <CustomButton
            type="submit"
            variant="contained"
            color="secondary"
            disabled={!deleteReady}
            name="delete"
          >
            {label}
          </CustomButton>
        </DialogActions>
      </form>
    </div>
  );
};

export default DeleteTemplate;
