import { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import { PartitionService } from '@/http';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import type { PartitionData } from '@server/types';
import { Typography } from '@mui/material';

interface LoadPartitionDialogProps {
  partitions: PartitionData[];
  collectionName: string;
  onRefresh?: () => void;
}

const LoadPartitionDialog: FC<LoadPartitionDialogProps> = (props) => {
  const { partitions, collectionName, onRefresh } = props;
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { t: partitionTrans } = useTranslation('partition');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    try {
      setLoading(true);
      await PartitionService.loadPartition({
        collectionName,
        partitionNames: partitions.map(p => p.name),
      });
      
      handleCloseDialog();
      openSnackBar(successTrans('load', { name: partitionTrans('partition') }));
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to load partition:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogTemplate
      title={dialogTrans('loadTitle', { type: partitionTrans('partition') })}
      handleClose={handleCloseDialog}
      children={
        <Typography variant="body1" component="p">
          {partitionTrans('loadContent')}
        </Typography>
      }
      confirmLabel={btnTrans('load')}
      handleConfirm={handleLoad}
      confirmDisabled={loading}
    />
  );
};

export default LoadPartitionDialog;
