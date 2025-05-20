import { FC, useContext } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { DataService } from '@/http';
import type { FlushDialogProps } from './Types';

const FlushDialog: FC<FlushDialogProps> = props => {
  const { cb, collectionName } = props;

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
      title={dialogTrans('flush', {
        type: collectionName,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography
            variant="body1"
            component="p"
            sx={{ margin: '8px 0 16px 0', maxWidth: '500px' }}
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
