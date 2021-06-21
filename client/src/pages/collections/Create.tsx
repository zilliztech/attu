import { makeStyles, Theme } from '@material-ui/core';
import { FC, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../../components/customDialog/DialogTemplate';
import CustomInput from '../../components/customInput/CustomInput';
import { ITextfieldConfig } from '../../components/customInput/Types';
import { rootContext } from '../../context/Root';
import { useFormValidation } from '../../hooks/Form';
import { generateId } from '../../utils/Common';
import { formatForm } from '../../utils/Form';
import CreateFields from './CreateFields';
import {
  CollectionCreateParam,
  CollectionCreateProps,
  DataTypeEnum,
  Field,
} from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  fieldset: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '&:last-child': {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },

    '& legend': {
      marginBottom: theme.spacing(2),
      color: `#82838e`,
      lineHeight: '20px',
      fontSize: '14px',
    },
  },
  input: {
    width: '48%',
  },
}));

const CreateCollection: FC<CollectionCreateProps> = ({ handleCreate }) => {
  const classes = useStyles();
  const { handleCloseDialog } = useContext(rootContext);
  const { t } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState({
    collection_name: '',
    description: '',
    autoID: true,
  });
  const [fields, setFields] = useState<Field[]>([
    {
      data_type: DataTypeEnum.Int64,
      is_primary_key: true,
      name: '',
      description: '',
      isDefault: true,
      id: generateId(),
    },
    {
      data_type: DataTypeEnum.FloatVector,
      is_primary_key: false,
      name: '',
      dimension: '',
      description: '',
      isDefault: true,
      id: generateId(),
    },
  ]);
  const [fieldsAllValid, setFieldsAllValid] = useState<boolean>(true);

  const checkedForm = useMemo(() => {
    const { collection_name } = form;
    return formatForm({ collection_name });
  }, [form]);
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  const changeIsAutoID = (value: boolean) => {
    setForm({
      ...form,
      autoID: value,
    });
  };

  const handleInputChange = (key: string, value: string) => {
    setForm(v => ({ ...v, [key]: value }));
  };

  const generalInfoConfigs: ITextfieldConfig[] = [
    {
      label: t('name'),
      key: 'collection_name',
      value: form.collection_name,
      onChange: (value: string) => handleInputChange('collection_name', value),
      variant: 'filled',
      validations: [
        {
          rule: 'require',
          errorText: warningTrans('required', { name: t('name') }),
        },
      ],
      className: classes.input,
    },
    {
      label: t('description'),
      key: 'description',
      value: form.description,
      onChange: (value: string) => handleInputChange('description', value),
      variant: 'filled',
      validations: [],
      className: classes.input,
    },
  ];

  const handleCreateCollection = () => {
    const param: CollectionCreateParam = {
      ...form,
      fields,
    };
    handleCreate(param);
  };

  return (
    <DialogTemplate
      title={t('createTitle')}
      handleCancel={handleCloseDialog}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateCollection}
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
            autoID={form.autoID}
            setAutoID={changeIsAutoID}
          />
        </fieldset>
      </form>
    </DialogTemplate>
  );
};

export default CreateCollection;
