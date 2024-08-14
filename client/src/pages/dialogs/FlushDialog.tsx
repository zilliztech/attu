import { FC, useContext } from 'react';
import { Typography, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { FlushDialogProps } from './Types';
import { DataService } from '@/http';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
    maxWidth: '500px',
  },
  dialog: {},
}));

const FlushDialog: FC<FlushDialogProps> = props => {
  const { cb, collectionName } = props;

  const classes = useStyles();

  const { handleCloseDialog } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');

  const handleConfirm = async () => {
    await DataService.flush(collectionName);

    handleCloseDialog();
    cb && cb();
  };

  const disabled = false;

  return (
    <DialogTemplate
      dialogClass={classes.dialog}
      title={dialogTrans('flush', {
        type: collectionName,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography
            variant="body1"
            component="p"
            className={classes.desc}
            dangerouslySetInnerHTML={{
              __html: dialogTrans('flushDialogInfo'),
            }}
          ></Typography>
        </>
      }
      confirmLabel={btnTrans('flush')}
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default FlushDialog;
