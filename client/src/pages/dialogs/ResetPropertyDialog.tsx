import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { CollectionObject } from '@server/types';
import { Property } from '../databases/collections/properties/Properties';

export interface EditPropertyProps {
  collection: CollectionObject;
  property: Property;
  cb?: (collection: CollectionObject) => void;
}

const ResetPropertyDialog: FC<EditPropertyProps> = props => {
  // context
  const { setProperty } = useContext(dataContext);
  const { handleCloseDialog } = useContext(rootContext);
  // props
  const { cb, collection, property } = props;

  // UI handlers
  const handleDelete = async () => {
    await setProperty(collection.collection_name, property.key, '');
    handleCloseDialog();
    cb && (await cb(collection));
  };

  // i18n
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  return (
    <DeleteTemplate
      label={btnTrans('reset')}
      title={dialogTrans('resetPropertyTitle')}
      text={dialogTrans('resetPropertyInfo')}
      compare={property.key}
      handleDelete={handleDelete}
    />
  );
};

export default ResetPropertyDialog;
