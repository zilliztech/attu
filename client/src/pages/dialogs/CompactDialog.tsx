import { FC, useContext } from 'react';
import { Typography, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { SegmentService } from '@/http';
import { makeStyles } from '@mui/styles';
import type { CompactDialogProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
    maxWidth: '500px',
  },
  dialog: {},
}));

const CompactDialog: FC<CompactDialogProps> = props => {
  const { cb, collectionName } = props;

  const classes = useStyles();

  const { handleCloseDialog } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const handleConfirm = async () => {
    await SegmentService.compact(collectionName);

    handleCloseDialog();
    cb && cb();
  };

  const disabled = false;

  return (
    <DialogTemplate
      dialogClass={classes.dialog}
      title={dialogTrans('compact', {
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
              __html: collectionTrans('compactDialogInfo'),
            }}
          ></Typography>
        </>
      }
      confirmLabel={btnTrans('confirm')}
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default CompactDialog;
