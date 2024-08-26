import { FC, useContext, useMemo, useState } from 'react';
import { Typography, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { formatForm } from '@/utils';
import { IForm, useFormValidation } from '@/hooks';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { CollectionObject } from '@server/types';
import { Property } from '@/consts';
import { makeStyles } from '@mui/styles';
import { DatabaseService } from '@/http';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
  },
}));

export interface EditPropertyProps {
  target: CollectionObject | string;
  type: 'collection' | 'database';
  property: Property;
  cb?: (target: CollectionObject | string) => void;
}

const EditPropertyDialog: FC<EditPropertyProps> = props => {
  const { setCollectionProperty } = useContext(dataContext);
  const { handleCloseDialog } = useContext(rootContext);

  const { cb, target, property } = props;
  const [form, setForm] = useState<IForm>({
    key: 'property',
    value: property.value,
  });

  const classes = useStyles();

  const checkedForm = useMemo(() => {
    return formatForm(form);
  }, [form]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const { t: dialogTrans } = useTranslation('dialog');
  const { t: warningTrans } = useTranslation('warning');
  const { t: btnTrans } = useTranslation('btn');

  const handleInputChange = (value: string) => {
    setForm({ ...form, key: 'property', value });
  };

  const handleConfirm = async () => {
    let value: unknown = '';

    if (form.value !== '') {
      switch (property.type) {
        case 'number':
          value = Number(form.value);
          break;
        case 'boolean':
          value = form.value === 'true';
          break;
        default:
          value = form.value;
      }
    }

    switch (props.type) {
      case 'collection':
        await setCollectionProperty(
          (target as CollectionObject).collection_name,
          property.key,
          value
        );
        break;
      case 'database':
        await DatabaseService.setProperty({
          db_name: target as string,
          properties: { [property.key]: value },
        });
        break;
    }

    handleCloseDialog();
    cb && (await cb(target));
  };

  const propertyInputConfig: ITextfieldConfig = {
    label: dialogTrans('value'),
    key: 'value',
    onChange: handleInputChange,
    variant: 'filled',
    placeholder: '',
    fullWidth: true,
    validations: [
      {
        rule: property.type === 'number' ? 'number' : 'bool',
        errorText:
          property.type === 'number'
            ? warningTrans('integer', { name: dialogTrans('value') })
            : warningTrans('bool', { name: dialogTrans('value') }),
      },
    ],
    defaultValue: form.value,
  };

  return (
    <DialogTemplate
      title={dialogTrans('editPropertyTitle')}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography variant="body1" component="p" className={classes.desc}>
            <code>
              <b>{property.key}</b>
            </code>
          </Typography>
          <CustomInput
            type="text"
            textConfig={propertyInputConfig}
            checkValid={checkIsValid}
            validInfo={validation}
          />
        </>
      }
      confirmLabel={btnTrans('confirm')}
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default EditPropertyDialog;
