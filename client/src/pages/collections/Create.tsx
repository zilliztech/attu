import { makeStyles, Theme } from '@material-ui/core';
import { FC, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../../components/customDialog/DialogTemplate';
import CustomInput from '../../components/customInput/CustomInput';
import { ITextfieldConfig } from '../../components/customInput/Types';
import { rootContext } from '../../context/Root';
import { useFormValidation } from '../../hooks/Form';
import { formatForm } from '../../utils/Form';
import CreateFields from './CreateFields';
import { CollectionCreateProps, DataTypeEnum, Field } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  fieldset: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& legend': {
      marginBottom: theme.spacing(2),
      color: `#82838e`,
      lineHeight: '20px',
      fontSize: '14px',
    },
  },
}));

const CreateCollection: FC<CollectionCreateProps> = ({ handleCreate }) => {
  const classes = useStyles();
  const { handleCloseDialog } = useContext(rootContext);
  const { t } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState({
    name: '',
    desc: '',
    autoID: true,
  });
  const [fields, setFields] = useState<Field[]>([
    {
      type: DataTypeEnum.Int64,
      isPrimaryKey: true,
      name: '',
      desc: '',
      isDefault: true,
    },
    {
      type: DataTypeEnum.FloatVector,
      isPrimaryKey: false,
      name: '',
      dimension: '',
      desc: '',
      isDefault: true,
    },
  ]);
  const [fieldsAllValid, setFieldsAllValid] = useState<boolean>(false);

  const checkedForm = useMemo(() => {
    const { name } = form;
    return formatForm({ name });
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const handleInputChange = (key: string, value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const generalInfoConfigs: ITextfieldConfig[] = [
    {
      label: t('name'),
      key: 'name',
      value: form.name,
      onChange: (value: string) => handleInputChange('name', value),
      variant: 'filled',
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', { name: t('name') }),
        },
      ],
    },
    {
      label: t('description'),
      key: 'description',
      value: form.desc,
      onChange: (value: string) => handleInputChange('desc', value),
      variant: 'filled',
      validations: [],
    },
  ];

  return (
    <DialogTemplate
      title={t('createTitle')}
      handleCancel={handleCloseDialog}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreate}
      confirmDisabled={disabled || !fieldsAllValid}
    >
      <form>
        <fieldset className={classes.fieldset}>
          <legend>{t('general')}</legend>
          {generalInfoConfigs.map(config => (
            <CustomInput
              key={config.key}
              type="text"
              textConfig={config}
              checkValid={checkIsValid}
              validInfo={validation}
            />
          ))}
        </fieldset>

        <fieldset className={classes.fieldset}>
          <legend>{t('structure')}</legend>
          <CreateFields
            fields={fields}
            setFields={setFields}
            setfieldsAllValid={setFieldsAllValid}
          />
        </fieldset>
      </form>
    </DialogTemplate>
  );
};

export default CreateCollection;
