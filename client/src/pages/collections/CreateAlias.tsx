import { FC, useContext, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { rootContext } from '../../context/Root';

import DialogTemplate from '../../components/customDialog/DialogTemplate';

import CustomInput from '../../components/customInput/CustomInput';
import { formatForm } from '../../utils/Form';
import { useFormValidation } from '../../hooks/Form';
import { ITextfieldConfig } from '../../components/customInput/Types';
import { CollectionHttp } from '../../http/Collection';
import { CreateAliasProps } from './Types';

const CreateAlias: FC<CreateAliasProps> = props => {
  const { cb, collectionName } = props;
  const [form, setForm] = useState({
    alias: '',
  });

  const checkedForm = useMemo(() => {
    const { alias } = form;
    return formatForm({ alias });
  }, [form]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const { handleCloseDialog } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: warningTrans } = useTranslation('warning');
  const { t: collectionTrans } = useTranslation('collection');

  const handleInputChange = (value: string) => {
    setForm({ alias: value });
  };

  const handleConfirm = async () => {
    await CollectionHttp.createAlias(collectionName, form);
    handleCloseDialog();
    cb && cb();
  };

  const aliasInputConfig: ITextfieldConfig = {
    label: 'Collection Alias',
    key: 'alias',
    onChange: handleInputChange,
    variant: 'filled',
    placeholder: 'alias name',
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
    defaultValue: form.alias,
  };
  return (
    <DialogTemplate
      title={dialogTrans('createAlias', {
        type: collectionName,
      })}
      handleClose={handleCloseDialog}
      children={
        <CustomInput
          type="text"
          textConfig={aliasInputConfig}
          checkValid={checkIsValid}
          validInfo={validation}
        />
      }
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default CreateAlias;
