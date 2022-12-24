import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '../../context/Root';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import { CollectionHttp } from '../../http/Collection';
import { DropCollectionProps } from './Types';

const DropCollectionDialog: FC<DropCollectionProps> = props => {
  const { collections, onDelete } = props;
  const { handleCloseDialog } = useContext(rootContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const handleDelete = async () => {
    for (const item of collections) {
      await CollectionHttp.deleteCollection(item._name);
    }

    handleCloseDialog();
    onDelete && onDelete();
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
