import { FC, useContext, useMemo, useState } from 'react';
import { Typography, makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomInput from '@/components/customInput/CustomInput';
import { formatForm } from '@/utils/Form';
import { useFormValidation } from '@/hooks';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { CollectionHttp } from '@/http/Collection';
import { CreateAliasProps } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    margin: '8px 0 16px 0',
  },
}));

const CreateAliasDialog: FC<CreateAliasProps> = props => {
  const { cb, collectionName } = props;
  const [form, setForm] = useState({
    alias: '',
  });

  const classes = useStyles();

  const checkedForm = useMemo(() => {
    const { alias } = form;
    return formatForm({ alias });
  }, [form]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const { handleCloseDialog } = useContext(rootContext);
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: warningTrans } = useTranslation('warning');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const handleInputChange = (value: string) => {
    setForm({ alias: value });
  };

  const handleConfirm = async () => {
    await CollectionHttp.createAlias(collectionName, form);
    handleCloseDialog();
    cb && cb();
  };

  const aliasInputConfig: ITextfieldConfig = {
    label: collectionTrans('alias'),
    key: 'alias',
    onChange: handleInputChange,
    variant: 'filled',
    placeholder: collectionTrans('aliasCreatePlaceholder'),
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
        <>
          <Typography variant="body1" component="p" className={classes.desc}>
            {collectionTrans('aliasInfo')}
          </Typography>
          <CustomInput
            type="text"
            textConfig={aliasInputConfig}
            checkValid={checkIsValid}
            validInfo={validation}
          />
        </>
      }
      confirmLabel={btnTrans('create')}
      handleConfirm={handleConfirm}
      confirmDisabled={disabled}
    />
  );
};

export default CreateAliasDialog;
