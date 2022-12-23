import { useContext, useState } from 'react';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CollectionHttp } from '../../http/Collection';
import { rootContext } from '../../context/Root';
import DialogTemplate from '../customDialog/DialogTemplate';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
    maxWidth: 480,
  },
}));

const ReleaseCollectionDialog = (props: any) => {
  const classes = useStyles();

  const { collection, onRelease } = props;
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: btnTrans } = useTranslation('btn');
  const { handleCloseDialog } = useContext(rootContext);
  const [disabled, setDisabled] = useState(false);

  // confirm action
  const handleConfirm = async () => {
    // disable confirm button
    setDisabled(true);
    // release collection
    await CollectionHttp.releaseCollection(collection);
    // enable confirm button
    setDisabled(false);
    // close dialog
    handleCloseDialog();
    // execute callback
    onRelease && onRelease();
  };

  return (
    <DialogTemplate
      title={dialogTrans('releaseTitle', {
        type: collection,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography variant="body1" component="p" className={classes.desc}>
            {dialogTrans('releaseContent', { type: collection })}
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