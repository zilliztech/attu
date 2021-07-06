import {
  DialogActions,
  DialogContent,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import { ChangeEvent, FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/customButton/CustomButton';
import CustomDialogTitle from '../../components/customDialog/CustomDialogTitle';
import { DeleteDialogContentType } from '../../components/customDialog/Types';
import { rootContext } from '../../context/Root';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: '480px',
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
    color: theme.palette.milvusGrey.dark,
  },
}));

const DeleteTemplate: FC<DeleteDialogContentType> = props => {
  const { title, text, label, handleDelete, handleCancel = () => {} } = props;
  const { handleCloseDialog } = useContext(rootContext);
  const classes = useStyles();
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');

  const [value, setValue] = useState<string>('');
  const [deleteReady, setDeleteReady] = useState<boolean>(false);

  const onCancelClick = () => {
    handleCloseDialog();
    handleCancel();
  };

  const onDeleteClick = () => {
    handleDelete();
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);

    setDeleteReady(value.toLowerCase() === label.toLowerCase());
  };

  return (
    <div className={classes.root}>
      <CustomDialogTitle classes={{ root: classes.mb }} onClose={onCancelClick}>
        {title}
      </CustomDialogTitle>

      <DialogContent>
        <Typography variant="body1">{text}</Typography>
        <Typography variant="body1" className={classes.mb}>
          {dialogTrans('deleteTipAction')}
          <strong
            className={classes.btnLabel}
          >{` ${label.toLowerCase()} `}</strong>
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
          variant="contained"
          onClick={onDeleteClick}
          color="secondary"
          disabled={!deleteReady}
          name="delete"
        >
          {label}
        </CustomButton>
      </DialogActions>
    </div>
  );
};

export default DeleteTemplate;
