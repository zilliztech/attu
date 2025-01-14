import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { PartitionService } from '@/http';
import { PartitionManageParam } from '../databases/collections/partitions/Types';
import { ManageRequestMethods } from '@/consts';
import { DropPartitionProps } from './Types';

const DropPartitionDialog: FC<DropPartitionProps> = props => {
  const { partitions, onDelete, collectionName } = props;
  const { handleCloseDialog } = useContext(rootContext);
  const { t: partitionTrans } = useTranslation('partition');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const handleDelete = async () => {
    for (const partition of partitions) {
      const param: PartitionManageParam = {
        partitionName: partition.name,
        collectionName,
        type: ManageRequestMethods.DELETE,
      };
      await PartitionService.managePartition(param);
    }

    handleCloseDialog();
    onDelete && onDelete();
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
