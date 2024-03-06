import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { DropCollectionProps } from './Types';

const DropCollectionDialog: FC<DropCollectionProps> = props => {
  const { collections, onDelete } = props;
  const { handleCloseDialog } = useContext(rootContext);
  const { dropCollection } = useContext(dataContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const handleDelete = async () => {
    for (const item of collections) {
      await dropCollection(item.collection_name);
    }

    handleCloseDialog();
    onDelete && (await onDelete());
  };

  return (
    <DeleteTemplate
      label={btnTrans('drop')}
      title={dialogTrans('deleteTitle', {
        type: collectionTrans('collection'),
      })}
      text={collectionTrans('deleteWarning')}
      handleDelete={handleDelete}
    />
  );
};

export default DropCollectionDialog;
