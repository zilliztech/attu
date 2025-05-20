import { FC, useContext } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { SegmentService } from '@/http';
import type { CompactDialogProps } from './Types';

const CompactDialog: FC<CompactDialogProps> = props => {
  const { cb, collectionName } = props;

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
      title={dialogTrans('compact', {
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
