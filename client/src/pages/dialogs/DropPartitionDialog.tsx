import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { PartitionService } from '@/http';
import { PartitionManageParam } from '../databases/collections/partitions/Types';
import { ManageRequestMethods } from '@/consts';
import type { PartitionData } from '@server/types';
import { ResStatus } from '@server/types';

export interface DropPartitionProps {
  partitions: PartitionData[];
  collectionName: string;
  onDelete: (res: ResStatus[]) => void;
}

const DropPartitionDialog: FC<DropPartitionProps> = props => {
  const { partitions, onDelete, collectionName } = props;
  const { handleCloseDialog } = useContext(rootContext);
  const { t: partitionTrans } = useTranslation('partition');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const handleDelete = async () => {
    const res = [];
    for (const partition of partitions) {
      const param: PartitionManageParam = {
        partitionName: partition.name,
        collectionName,
        type: ManageRequestMethods.DELETE,
      };
      res.push(await PartitionService.managePartition(param));
    }

    handleCloseDialog();
    onDelete && onDelete(res);
  };

  return (
    <DeleteTemplate
      label={btnTrans('drop')}
      title={dialogTrans('deleteTitle', { type: partitionTrans('partition') })}
      text={partitionTrans('deleteWarning')}
      handleDelete={handleDelete}
    />
  );
};

export default DropPartitionDialog;
