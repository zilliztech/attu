import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { DropCollectionProps } from './Types';

const DropCollectionDialog: FC<DropCollectionProps> = props => {
  const { collections, onDelete } = props;
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { dropCollection } = useContext(dataContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const { t: dialogTrans } = useTranslation('dialog');

  const handleDelete = async () => {
    const res = [];
    for (const item of collections) {
      res.push(await dropCollection(item.collection_name));
    }

    // show success message
    openSnackBar(
      successTrans('delete', {
        name: collectionTrans('collection'),
      })
    );

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
