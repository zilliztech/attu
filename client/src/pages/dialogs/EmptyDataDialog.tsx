import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { DataService } from '@/http';
import { EmptyDataProps } from './Types';

const EmptyDataDialog: FC<EmptyDataProps> = props => {
  const { cb, collectionName } = props;

  const { handleCloseDialog } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const handleDelete = async () => {
    // duplicate
    await DataService.emptyData(collectionName);
    // close dialog
    handleCloseDialog();
    cb && cb();
  };

  return (
    <DeleteTemplate
      label={btnTrans('empty')}
      title={dialogTrans('emptyTitle', {
        type: collectionTrans('collection'),
      })}
      compare={collectionName}
      text={dialogTrans('emptyDataDialogInfo')}
      handleDelete={handleDelete}
    />
  );
};

export default EmptyDataDialog;
