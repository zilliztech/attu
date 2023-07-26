import { FC, useContext, useMemo, useState } from 'react';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context/Root';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { formatForm } from '@/utils/Form';
import { useFormValidation } from '@/hooks/Form';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { CollectionHttp } from '@/http/Collection';
import { RenameCollectionProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
  },
}));

const RenameCollectionDialog: FC<RenameCollectionProps> = props => {
  const { collectionName, cb } = props;
  const [form, setForm] = useState({
    new_collection_name: '',
  });

  const classes = useStyles();

  const checkedForm = useMemo(() => {
    const { new_collection_name } = form;
    return formatForm({ new_collection_name });
  }, [form]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const { handleCloseDialog } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: warningTrans } = useTranslation('warning');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const handleInputChange = (value: string) => {
    setForm({ new_collection_name: value });
  };

  const handleConfirm = async () => {
    await CollectionHttp.renameCollection(collectionName, form);
    handleCloseDialog();
    cb && cb();
  };

  const renameInputCfg: ITextfieldConfig = {
    label: collectionTrans('newColName'),
    key: 'new_collection_name',
    onChange: handleInputChange,
    variant: 'filled',
    placeholder: collectionTrans('newColNamePlaceholder'),
    fullWidth: true,
    validations: [
      {
        rule: 'require',
        errorText: warningTrans('required', {
          name: collectionTrans('name'),
        }),
      },
      {
        rule: 'collectionName',
        errorText: collectionTrans('nameContentWarning'),
      },
    ],
    defaultValue: form.new_collection_name,
  };
  return (
    <DialogTemplate
      title={dialogTrans('renameTitle', {
        type: collectionName,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography variant="body1" component="p" className={classes.desc}>
            {collectionTrans('newNameInfo')}
          </Typography>
          <CustomInput
            type="text"
            textConfig={renameInputCfg}
            checkValid={checkIsValid}
            validInfo={validation}
          />
        </>
      }
      confirmLabel={btnTrans('rename')}
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default RenameCollectionDialog;
