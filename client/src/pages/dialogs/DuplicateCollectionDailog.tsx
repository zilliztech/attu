import { FC, useContext, useMemo, useState } from 'react';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { formatForm } from '@/utils';
import { useFormValidation } from '@/hooks';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { DuplicateCollectionDialogProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    width: theme.spacing(48),
  },
  desc: {
    margin: '8px 0 16px 0',
  },
}));

const DuplicateCollectionDialog: FC<DuplicateCollectionDialogProps> = props => {
  const { duplicateCollection } = useContext(dataContext);

  const { cb, collectionName, collections } = props;
  const [form, setForm] = useState({
    duplicate: `${collectionName}_duplicate`,
  });

  const classes = useStyles();

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
    await duplicateCollection(collectionName, form.duplicate);
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
      dialogClass={classes.wrapper}
      title={dialogTrans('duplicateTitle', {
        type: collectionName,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography variant="body1" component="p" className={classes.desc}>
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
