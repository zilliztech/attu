import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { DropPartitionProps } from './Types';
import { PartitionHttp } from '@/http/Partition';
import { PartitionManageParam } from '../partitions/Types';
import { ManageRequestMethods } from '../../types/Common';

const DropPartitionDialog: FC<DropPartitionProps> = props => {
  const { partitions, onDelete, collectionName } = props;
  const { handleCloseDialog } = useContext(rootContext);
  const { t: partitionTrans } = useTranslation('partition');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const handleDelete = async () => {
    for (const partition of partitions) {
      const param: PartitionManageParam = {
        partitionName: partition._name,
        collectionName,
        type: ManageRequestMethods.DELETE,
      };
      await PartitionHttp.managePartition(param);
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
