import { useContext, useState } from 'react';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { rootContext, dataContext } from '@/context';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
    maxWidth: 480,
  },
}));

const ReleaseCollectionDialog = (props: any) => {
  const { releaseCollection } = useContext(dataContext);

  const classes = useStyles();

  const { collectionName, onRelease } = props;
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog } = useContext(rootContext);
  const [disabled, setDisabled] = useState(false);

  // confirm action
  const handleConfirm = async () => {
    // disable confirm button
    setDisabled(true);
    try {
      // release collection
      await releaseCollection(collectionName);

      // execute callback
      onRelease && (await onRelease(collectionName));
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
        type: collectionName,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography variant="body1" component="p" className={classes.desc}>
            {dialogTrans('releaseContent', { type: collectionName })}
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
