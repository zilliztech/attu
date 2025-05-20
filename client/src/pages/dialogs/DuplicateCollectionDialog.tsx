import { FC, useContext, useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { formatForm } from '@/utils';
import { useFormValidation } from '@/hooks';
import { ITextfieldConfig } from '@/components/customInput/Types';
import type { CollectionObject } from '@server/types';
import { CollectionService } from '@/http';

export interface DuplicateCollectionDialogProps {
  collection: CollectionObject;
  collections: CollectionObject[];
  cb?: (collectionName: string) => void;
}

const DuplicateCollectionDialog: FC<DuplicateCollectionDialogProps> = props => {
  const { fetchCollection } = useContext(dataContext);

  const { cb, collection, collections } = props;
  const [form, setForm] = useState({
    duplicate: `${collection.collection_name}_duplicate`,
  });

  const checkedForm = useMemo(() => {
    const { duplicate } = form;
    return formatForm({ duplicate });
  }, [form]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const { handleCloseDialog, openSnackBar } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: warningTrans } = useTranslation('warning');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');

  const handleInputChange = (value: string) => {
    setForm({ duplicate: value });
  };

  const handleConfirm = async () => {
    // duplicate
    await CollectionService.duplicateCollection(
      collection.collection_name,
      form.duplicate
    );
    //refresh collection
    await fetchCollection(form.duplicate);
    // show success message
    openSnackBar(
      successTrans('duplicate', {
        name: collectionTrans('collection'),
      })
    );
    // close dialog
    handleCloseDialog();
    cb && (await cb(form.duplicate));
  };

  const duplicateInputConfig: ITextfieldConfig = {
    label: collectionTrans('newColNamePlaceholder'),
    key: 'duplicate',
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
      {
        rule: 'custom',
        extraParam: {
          compare: value => {
            return !collections.some(
              collection => collection.collection_name === value
            );
          },
        },
        errorText: collectionTrans('duplicateNameExist'),
      },
    ],
    defaultValue: form.duplicate,
  };

  return (
    <DialogTemplate
      sx={{ width: theme => theme.spacing(48) }}
      title={dialogTrans('duplicateTitle', {
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
            {dialogTrans('duplicateCollectionInfo')}
          </Typography>
          <CustomInput
            type="text"
            textConfig={duplicateInputConfig}
            checkValid={checkIsValid}
            validInfo={validation}
          />
        </>
      }
      confirmLabel={btnTrans('duplicate')}
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default DuplicateCollectionDialog;
