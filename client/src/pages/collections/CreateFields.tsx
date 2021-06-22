import { makeStyles, Theme, TextField, IconButton } from '@material-ui/core';
import { FC, Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/customButton/CustomButton';
import CustomSelector from '../../components/customSelector/CustomSelector';
import icons from '../../components/icons/Icons';
import { PRIMARY_KEY_FIELD } from '../../consts/Milvus';
import { generateId } from '../../utils/Common';
import { getCreateFieldType } from '../../utils/Format';
import { checkEmptyValid, getCheckResult } from '../../utils/Validation';
import {
  ALL_OPTIONS,
  AUTO_ID_OPTIONS,
  VECTOR_FIELDS_OPTIONS,
} from './Constants';
import {
  CreateFieldsProps,
  CreateFieldType,
  DataTypeEnum,
  Field,
} from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  rowWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '10px',
    width: '100%',

    '& .dimension': {
      maxWidth: '160px',
    },
  },
  input: {
    fontSize: '14px',
  },
  primaryInput: {
    maxWidth: '160px',
  },
  select: {
    width: '160px',
    marginBottom: '22px',
  },
  descInput: {
    minWidth: '270px',
    flexGrow: 1,
  },
  btnTxt: {
    textTransform: 'uppercase',
  },
  iconBtn: {
    padding: 0,
    width: '20px',
    height: '20px',
  },
  mb3: {
    marginBottom: theme.spacing(3),
  },
  mb2: {
    marginBottom: theme.spacing(2),
  },
  helperText: {
    color: theme.palette.error.main,
  },
}));

type inputType = {
  label: string;
  value: string | number | null;
  handleChange?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  isReadOnly?: boolean;
  validate?: (value: string | number | null) => string;
  type?: 'number' | 'text';
};

const CreateFields: FC<CreateFieldsProps> = ({
  fields,
  setFields,
  setAutoID,
  autoID,
  setFieldsValidation,
}) => {
  const { t } = useTranslation('collection');
  const { t: warningTrans } = useTranslation('warning');

  const classes = useStyles();

  const AddIcon = icons.add;
  const RemoveIcon = icons.remove;

  const getSelector = (
    type: 'all' | 'vector',
    label: string,
    value: number,
    onChange: (value: DataTypeEnum) => void
  ) => {
    return (
      <CustomSelector
        options={type === 'all' ? ALL_OPTIONS : VECTOR_FIELDS_OPTIONS}
        onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
          onChange(e.target.value as DataTypeEnum);
        }}
        value={value}
        variant="filled"
        label={label}
        classes={{ root: classes.select }}
      />
    );
  };

  const getInput = (data: inputType) => {
    const {
      label,
      value,
      handleChange = () => {},
      className = '',
      inputClassName = '',
      isReadOnly = false,
      validate = (value: string | number | null) => ' ',
      type = 'text',
    } = data;
    return (
      <TextField
        label={label}
        // value={value}
        onBlur={(e: React.ChangeEvent<{ value: unknown }>) => {
          handleChange(e.target.value as string);
        }}
        variant="filled"
        className={className}
        InputProps={{
          classes: {
            input: inputClassName,
          },
        }}
        disabled={isReadOnly}
        helperText={validate(value)}
        FormHelperTextProps={{
          className: classes.helperText,
        }}
        defaultValue={value}
        type={type}
      />
    );
  };

  const generateFieldName = (field: Field) => {
    return getInput({
      label: t('fieldName'),
      value: field.name,
      handleChange: (value: string) => {
        const isValid = checkEmptyValid(value);
        setFieldsValidation(v =>
          v.map(item =>
            item.id === field.id ? { ...item, name: isValid } : item
          )
        );

        changeFields(field.id, 'name', value);
      },
      validate: (value: any) => {
        if (value === null) return ' ';
        const isValid = checkEmptyValid(value);

        return isValid
          ? ' '
          : warningTrans('required', { name: t('fieldName') });
      },
    });
  };

  const generateDesc = (field: Field) => {
    return getInput({
      label: t('description'),
      value: field.description,
      handleChange: (value: string) =>
        changeFields(field.id, 'description', value),
      className: classes.descInput,
    });
  };

  const generateDimension = (field: Field) => {
    return getInput({
      label: t('dimension'),
      value: field.dimension as number,
      handleChange: (value: string) => {
        const isValid = getCheckResult({
          value,
          rule: 'positiveNumber',
        });
        changeFields(field.id, 'dimension', `${value}`);

        setFieldsValidation(v =>
          v.map(item =>
            item.id === field.id ? { ...item, dimension: isValid } : item
          )
        );
      },
      type: 'number',
      validate: (value: any) => {
        const isValid = getCheckResult({
          value,
          rule: 'positiveNumber',
        });

        return isValid ? ' ' : 'wrong';
      },
    });
  };

  const changeFields = (id: string, key: string, value: any) => {
    const newFields = fields.map(f => {
      if (f.id !== id) {
        return f;
      }
      return {
        ...f,
        [key]: value,
      };
    });
    setFields(newFields);
  };

  const handleAddNewField = () => {
    const id = generateId();
    const newDefaultItem: Field = {
      name: null,
      data_type: DataTypeEnum.Int16,
      is_primary_key: false,
      description: '',
      isDefault: false,
      dimension: 128,
      id,
    };
    const newValidation = {
      id,
      name: false,
      dimension: true,
    };
    setFields([...fields, newDefaultItem]);
    setFieldsValidation(v => [...v, newValidation]);
  };

  const handleRemoveField = (field: Field) => {
    const newFields = fields.filter(f => f.id !== field.id);
    setFields(newFields);
    setFieldsValidation(v => v.filter(item => item.id !== field.id));
  };

  const generatePrimaryKeyRow = (
    field: Field,
    autoID: boolean
  ): ReactElement => {
    return (
      <div className={`${classes.rowWrapper} ${classes.mb3}`}>
        {getInput({
          label: t('fieldType'),
          value: PRIMARY_KEY_FIELD,
          className: classes.primaryInput,
          inputClassName: classes.input,
          isReadOnly: true,
        })}

        {generateFieldName(field)}

        <CustomSelector
          label={t('autoId')}
          options={AUTO_ID_OPTIONS}
          value={autoID ? 'true' : 'false'}
          onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
            const autoId = e.target.value === 'true';
            setAutoID(autoId);
          }}
          variant="filled"
          classes={{ root: classes.select }}
        />

        {generateDesc(field)}
      </div>
    );
  };

  const generateDefaultVectorRow = (field: Field): ReactElement => {
    return (
      <>
        <div className={`${classes.rowWrapper} ${classes.mb2}`}>
          {getSelector(
            'vector',
            t('fieldType'),
            field.data_type,
            (value: DataTypeEnum) => changeFields(field.id, 'data_type', value)
          )}

          {generateFieldName(field)}

          {generateDimension(field)}

          {generateDesc(field)}
        </div>

        <CustomButton onClick={handleAddNewField} className={classes.mb2}>
          <AddIcon />
          <span className={classes.btnTxt}>{t('newBtn')}</span>
        </CustomButton>
      </>
    );
  };

  const generateNumberRow = (field: Field): ReactElement => {
    return (
      <div className={`${classes.rowWrapper} ${classes.mb2}`}>
        <IconButton
          onClick={() => handleRemoveField(field)}
          classes={{ root: classes.iconBtn }}
          aria-label="delete"
        >
          <RemoveIcon />
        </IconButton>
        {generateFieldName(field)}
        {getSelector(
          'all',
          t('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id, 'data_type', value)
        )}

        {generateDesc(field)}
      </div>
    );
  };

  const generateVectorRow = (field: Field) => {
    return (
      <div className={`${classes.rowWrapper} ${classes.mb2}`}>
        <IconButton classes={{ root: classes.iconBtn }} aria-label="delete">
          <RemoveIcon />
        </IconButton>
        {generateFieldName(field)}
        {getSelector(
          'all',
          t('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id, 'data_type', value)
        )}
        {generateDimension(field)}

        {generateDesc(field)}
      </div>
    );
  };

  const generateFieldRow = (field: Field, autoID: boolean) => {
    const createType: CreateFieldType = getCreateFieldType(field);
    switch (createType) {
      case 'primaryKey': {
        return generatePrimaryKeyRow(field, autoID);
      }
      case 'defaultVector': {
        return generateDefaultVectorRow(field);
      }
      case 'vector': {
        return generateVectorRow(field);
      }
      // use number as default createType
      default: {
        return generateNumberRow(field);
      }
    }
  };

  return (
    <>
      {fields.map((field, index) => (
        <Fragment key={index}>{generateFieldRow(field, autoID)}</Fragment>
      ))}
    </>
  );
};

export default CreateFields;
