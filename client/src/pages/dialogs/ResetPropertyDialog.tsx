import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { Property } from '@/consts';
import { DatabaseService, CollectionService } from '@/http';
import type { CollectionObject } from '@server/types';

export interface EditPropertyProps {
  target: CollectionObject | string;
  type: 'collection' | 'database';
  property: Property;
  cb?: (target: CollectionObject | string) => void;
}

const ResetPropertyDialog: FC<EditPropertyProps> = props => {
  // context
  const { fetchCollection } = useContext(dataContext);
  const { handleCloseDialog } = useContext(rootContext);
  // props
  const { cb, target, type, property } = props;

  // UI handlers
  const handleDelete = async () => {
    switch (type) {
      case 'collection':
        const collection = target as CollectionObject;
        if (!collection || !collection.schema) {
          return;
        }
        // Reset the property in the collection schema
        await CollectionService.setProperty(collection.collection_name, {
          [property.key]: '',
        });
        // Refresh the collection to get the latest schema
        await fetchCollection((target as CollectionObject).collection_name);
        break;

      case 'database':
        await DatabaseService.setProperty({
          db_name: target as string,
          properties: { [property.key]: '' },
        });
        break;
    }

    handleCloseDialog();
    cb && (await cb(target));
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
