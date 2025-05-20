import { useContext, useState } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { rootContext, dataContext } from '@/context';
import type { CollectionObject } from '@server/types';
import { CollectionService } from '@/http';

const ReleaseCollectionDialog = (props: {
  collection: CollectionObject;
  onRelease?: (collection: CollectionObject) => void;
}) => {
  const { fetchCollection } = useContext(dataContext);

  const { collection, onRelease } = props;
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const { t: collectionTrans } = useTranslation('collection');
  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const [disabled, setDisabled] = useState(false);

  // confirm action
  const handleConfirm = async () => {
    // disable confirm button
    setDisabled(true);
    try {
      // release collection
      await CollectionService.releaseCollection(collection.collection_name);

      // refresh collection
      await fetchCollection(collection.collection_name);

      // show success message
      openSnackBar(
        successTrans('release', {
          name: collectionTrans('collection'),
        })
      );

      // execute callback
      onRelease && (await onRelease(collection));
      // enable confirm button
      setDisabled(false);
      // close dialog
      handleCloseDialog();
    } finally {
      // enable confirm button
      setDisabled(false);
    }
  };

  return (
    <DialogTemplate
      title={dialogTrans('releaseTitle', {
        type: collection.collection_name,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography
            variant="body1"
            component="p"
            sx={{
              margin: '8px 0 16px 0',
              maxWidth: 480,
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            {dialogTrans('releaseContent', {
              type: collection.collection_name,
            })}
          </Typography>
        </>
      }
      confirmLabel={btnTrans('release')}
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default ReleaseCollectionDialog;
