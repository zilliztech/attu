import { FC, useContext, useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import { formatForm } from '@/utils';
import { useFormValidation } from '@/hooks';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import type { ITextfieldConfig } from '@/components/customInput/Types';
import type { CollectionObject } from '@server/types';
import { CollectionService } from '@/http';

export interface RenameCollectionProps {
  collection: CollectionObject;
  cb?: (collectionName: string) => void;
}

const RenameCollectionDialog: FC<RenameCollectionProps> = props => {
  const { collection, cb } = props;
  const [form, setForm] = useState({
    new_collection_name: '',
  });

  const checkedForm = useMemo(() => {
    const { new_collection_name } = form;
    return formatForm({ new_collection_name });
  }, [form]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: warningTrans } = useTranslation('warning');
  const { t: successTrans } = useTranslation('success');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const handleInputChange = (value: string) => {
    setForm({ new_collection_name: value });
  };

  const handleConfirm = async () => {
    await CollectionService.renameCollection(
      collection.collection_name,
      form.new_collection_name
    );
    openSnackBar(
      successTrans('rename', {
        name: collectionTrans('collection'),
      })
    );
    handleCloseDialog();
    cb && (await cb(form.new_collection_name));
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
              color: theme => theme.palette.text.secondary,
            }}
          >
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
