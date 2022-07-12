import { makeStyles, Theme } from '@material-ui/core';
import { FC, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '../../components/customDialog/DialogTemplate';
import CustomInput from '../../components/customInput/CustomInput';
import CustomSelector from '../../components/customSelector/CustomSelector';
import { ITextfieldConfig } from '../../components/customInput/Types';
import { rootContext } from '../../context/Root';
import { useFormValidation } from '../../hooks/Form';
import { formatForm } from '../../utils/Form';
import { TypeEnum } from '../../utils/Validation';
import CreateFields from './CreateFields';
import {
  CollectionCreateParam,
  CollectionCreateProps,
  DataTypeEnum,
  ConsistencyLevelEnum,
  Field,
} from './Types';
import { CONSISTENCY_LEVEL_OPTIONS } from './Constants';

const useStyles = makeStyles((theme: Theme) => ({
  fieldset: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '&:nth-last-child(2)': {
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
  select: {
    width: '160px',
    marginBottom: '22px',

    '&:first-child': {
      marginLeft: 0,
    },
  },
}));

const CreateCollection: FC<CollectionCreateProps> = ({ handleCreate }) => {
  const classes = useStyles();
  const { handleCloseDialog } = useContext(rootContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');

  const [form, setForm] = useState({
    collection_name: '',
    description: '',
    autoID: true,
  });

  const [consistencyLevel, setConsistencyLevel] =
    useState<ConsistencyLevelEnum>(ConsistencyLevelEnum.Session); // Session is the default value of consistency level

  const [fields, setFields] = useState<Field[]>([
    {
      data_type: DataTypeEnum.Int64,
      is_primary_key: true,
      name: null, // we need hide helpertext at first time, so we use null to detect user enter input or not.
      description: '',
      isDefault: true,
      max_length: null,
      id: '1',
    },
    {
      data_type: DataTypeEnum.FloatVector,
      is_primary_key: false,
      name: null,
      dimension: '128',
      description: '',
      isDefault: true,
      id: '2',
    },
  ]);

  const [fieldsValidation, setFieldsValidation] = useState<
    {
      [x: string]: string | boolean;
    }[]
  >([
    { id: '1', name: false },
    { id: '2', name: false, dimension: true },
  ]);

  const allFieldsValid = useMemo(() => {
    return fieldsValidation.every(v => Object.keys(v).every(key => !!v[key]));
  }, [fieldsValidation]);

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
      label: collectionTrans('name'),
      key: 'collection_name',
      value: form.collection_name,
      onChange: (value: string) => handleInputChange('collection_name', value),
      variant: 'filled',
      validations: [
        // cannot be empty
        {
          rule: 'require',
          errorText: warningTrans('required', {
            name: collectionTrans('name'),
          }),
        },
        // length <= 255
        {
          rule: 'range',
          extraParam: {
            max: 255,
            type: 'string',
          },
          errorText: collectionTrans('nameLengthWarning'),
        },
        // name can only be combined with letters, number or underscores
        {
          rule: 'collectionName',
          errorText: collectionTrans('nameContentWarning'),
        },
        // name can not start with number
        {
          rule: 'firstCharacter',
          extraParam: {
            invalidTypes: [TypeEnum.number],
          },
          errorText: collectionTrans('nameFirstLetterWarning'),
        },
      ],
      className: classes.input,
    },
    {
      label: collectionTrans('description'),
      key: 'description',
      value: form.description,
      onChange: (value: string) => handleInputChange('description', value),
      variant: 'filled',
      validations: [],
      className: classes.input,
    },
  ];

  const handleCreateCollection = () => {
    const vectorType = [DataTypeEnum.BinaryVector, DataTypeEnum.FloatVector];
    const param: CollectionCreateParam = {
      ...form,
      fields: fields.map(v => {
        const data: any = {
          name: v.name,
          description: v.description,
          is_primary_key: v.is_primary_key,
          data_type: v.data_type,
          dimension: vectorType.includes(v.data_type) ? v.dimension : undefined,
          max_length: v.max_length,
        };

        v.is_primary_key && (data.autoID = form.autoID);

        return data;
      }),
      consistency_level: consistencyLevel,
    };
    handleCreate(param);
  };

  return (
    <DialogTemplate
      title={collectionTrans('createTitle')}
      handleClose={handleCloseDialog}
      confirmLabel={btnTrans('create')}
      handleConfirm={handleCreateCollection}
      confirmDisabled={disabled || !allFieldsValid}
    >
      <form>
        <fieldset className={classes.fieldset}>
          <legend>{collectionTrans('general')}</legend>
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
          <legend>{collectionTrans('schema')}</legend>
          <CreateFields
            fields={fields}
            setFields={setFields}
            setFieldsValidation={setFieldsValidation}
            autoID={form.autoID}
            setAutoID={changeIsAutoID}
          />
        </fieldset>

        <fieldset className={classes.fieldset}>
          <legend>{collectionTrans('consistency')}</legend>
          <CustomSelector
            wrapperClass={classes.select}
            options={CONSISTENCY_LEVEL_OPTIONS}
            onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
              setConsistencyLevel(e.target.value as ConsistencyLevelEnum);
            }}
            value={consistencyLevel}
            variant="filled"
            label={'Consistency'}
          />
        </fieldset>
      </form>
    </DialogTemplate>
  );
};

export default CreateCollection;
