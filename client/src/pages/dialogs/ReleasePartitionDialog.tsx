import { FC, useContext, useState } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { PartitionService } from '@/http';
import type { PartitionData } from '@server/types';

interface ReleasePartitionDialogProps {
  partitions: PartitionData[];
  collectionName: string;
  onRefresh?: () => void;
}

const ReleasePartitionDialog: FC<ReleasePartitionDialogProps> = (props) => {
  const { partitions, collectionName, onRefresh } = props;
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { t: partitionTrans } = useTranslation('partition');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const [disabled, setDisabled] = useState(false);

  const handleConfirm = async () => {
    setDisabled(true);
    try {
      await PartitionService.releasePartition({
        collectionName,
        partitionNames: partitions.map(p => p.name),
      });
      
      openSnackBar(successTrans('release', { name: partitionTrans('partition') }));
      
      if (onRefresh) {
        setTimeout(() => onRefresh(), 1000);
      }
      
      handleCloseDialog();
    } finally {
      setDisabled(false);
    }
  };

  const partitionName = partitions.map(p => p.name).join(', ');

  return (
    <DialogTemplate
      title={dialogTrans('releaseTitle', {
        type: partitionName,
      })}
      handleClose={handleCloseDialog}
      children={
        <Typography
          variant="body1"
          component="p"
          sx={{
            margin: '8px 0 16px 0',
            maxWidth: 480,
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          {dialogTrans('releaseContent', {
            type: partitionName,
          })}
        </Typography>
      }
      confirmLabel={btnTrans('release')}
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default ReleasePartitionDialog;
