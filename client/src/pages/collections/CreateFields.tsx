import { makeStyles, Theme, TextField, IconButton } from '@material-ui/core';
import { FC, Fragment, ReactElement, useMemo } from 'react';
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
  optionalWrapper: {
    width: '100%',
    paddingRight: theme.spacing(1),
    maxHeight: '240px',
    overflowY: 'auto',
  },
  rowWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    // only Safari 14.1+ support flexbox gap
    // gap: '10px',
    width: '100%',

    '& > *': {
      marginLeft: '10px',
    },

    '& .dimension': {
      maxWidth: '160px',
    },
  },
  input: {
    fontSize: '14px',
  },
  primaryInput: {
    maxWidth: '160px',

    '&:first-child': {
      marginLeft: 0,
    },
  },
  select: {
    width: '160px',
    marginBottom: '22px',

    '&:first-child': {
      marginLeft: 0,
    },
  },
  descInput: {
    minWidth: '270px',
    flexGrow: 1,
  },
  btnTxt: {
    textTransform: 'uppercase',
  },
  iconBtn: {
    marginLeft: 0,

    padding: 0,
    width: '20px',
    height: '20px',
  },
  mb2: {
    marginBottom: theme.spacing(2),
  },
  helperText: {
    lineHeight: '20px',
    margin: theme.spacing(0.25, 0),
    marginLeft: '12px',
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
  const { t: collectionTrans } = useTranslation('collection');
  const { t: warningTrans } = useTranslation('warning');

  const classes = useStyles();

  const AddIcon = icons.add;
  const RemoveIcon = icons.remove;

  const { requiredFields, optionalFields } = useMemo(
    () =>
      fields.reduce(
        (acc, field) => {
          const createType: CreateFieldType = getCreateFieldType(field);
          const requiredTypes: CreateFieldType[] = [
            'primaryKey',
            'defaultVector',
          ];
          const key = requiredTypes.includes(createType)
            ? 'requiredFields'
            : 'optionalFields';

          acc[key].push({
            ...field,
            createType,
          });

          return acc;
        },
        {
          requiredFields: [] as Field[],
          optionalFields: [] as Field[],
        }
      ),

    [fields]
  );

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
        error={validate(value) !== ' '}
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
      label: collectionTrans('fieldName'),
      value: field.name,
      handleChange: (value: string) => {
        const isValid = checkEmptyValid(value);
        setFieldsValidation(v =>
          v.map(item =>
            item.id === field.id! ? { ...item, name: isValid } : item
          )
        );

        changeFields(field.id!, 'name', value);
      },
      validate: (value: any) => {
        if (value === null) return ' ';
        const isValid = checkEmptyValid(value);

        return isValid
          ? ' '
          : warningTrans('required', { name: collectionTrans('fieldName') });
      },
    });
  };

  const generateDesc = (field: Field) => {
    return getInput({
      label: collectionTrans('description'),
      value: field.description,
      handleChange: (value: string) =>
        changeFields(field.id!, 'description', value),
      className: classes.descInput,
    });
  };

  const generateDimension = (field: Field) => {
    const validateDimension = (value: string) => {
      const isPositive = getCheckResult({
        value,
        rule: 'positiveNumber',
      });
      const isMutiple = getCheckResult({
        value,
        rule: 'multiple',
        extraParam: {
          multipleNumber: 8,
        },
      });
      if (field.data_type === DataTypeEnum.BinaryVector) {
        return {
          isMutiple,
          isPositive,
        };
      }
      return {
        isPositive,
      };
    };
    return getInput({
      label: collectionTrans('dimension'),
      value: field.dimension as number,
      handleChange: (value: string) => {
        const { isPositive, isMutiple } = validateDimension(value);
        const isValid =
          field.data_type === DataTypeEnum.BinaryVector
            ? !!isMutiple && isPositive
            : isPositive;

        changeFields(field.id!, 'dimension', `${value}`);

        setFieldsValidation(v =>
          v.map(item =>
            item.id === field.id! ? { ...item, dimension: isValid } : item
          )
        );
      },
      type: 'number',
      validate: (value: any) => {
        const { isPositive, isMutiple } = validateDimension(value);
        if (isMutiple === false) {
          return collectionTrans('dimensionMutipleWarning');
        }

        return isPositive ? ' ' : collectionTrans('dimensionPositiveWarning');
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
      dimension: '128',
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
      <div className={`${classes.rowWrapper}`}>
        {getInput({
          label: collectionTrans('fieldType'),
          value: PRIMARY_KEY_FIELD,
          className: classes.primaryInput,
          inputClassName: classes.input,
          isReadOnly: true,
        })}

        {generateFieldName(field)}

        <CustomSelector
          label={collectionTrans('autoId')}
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
        <div className={`${classes.rowWrapper}`}>
          {getSelector(
            'vector',
            collectionTrans('fieldType'),
            field.data_type,
            (value: DataTypeEnum) => changeFields(field.id!, 'data_type', value)
          )}

          {generateFieldName(field)}

          {generateDimension(field)}

          {generateDesc(field)}
        </div>

        <CustomButton onClick={handleAddNewField} className={classes.mb2}>
          <AddIcon />
          <span className={classes.btnTxt}>{collectionTrans('newBtn')}</span>
        </CustomButton>
      </>
    );
  };

  const generateNumberRow = (field: Field): ReactElement => {
    return (
      <div className={`${classes.rowWrapper}`}>
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
          collectionTrans('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id!, 'data_type', value)
        )}

        {generateDesc(field)}
      </div>
    );
  };

  const generateVectorRow = (field: Field) => {
    return (
      <div className={`${classes.rowWrapper}`}>
        <IconButton classes={{ root: classes.iconBtn }} aria-label="delete">
          <RemoveIcon />
        </IconButton>
        {generateFieldName(field)}
        {getSelector(
          'all',
          collectionTrans('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id!, 'data_type', value)
        )}
        {generateDimension(field)}

        {generateDesc(field)}
      </div>
    );
  };

  const generateRequiredFieldRow = (field: Field, autoID: boolean) => {
    // required type is primaryKey or defaultVector
    if (field.createType === 'primaryKey') {
      return generatePrimaryKeyRow(field, autoID);
    }
    // use defaultVector as default return type
    return generateDefaultVectorRow(field);
  };

  const generateOptionalFieldRow = (field: Field) => {
    // optional type is vector or number
    if (field.createType === 'vector') {
      return generateVectorRow(field);
    }

    // use number as default createType
    return generateNumberRow(field);
  };

  return (
    <>
      {requiredFields.map((field, index) => (
        <Fragment key={index}>
          {generateRequiredFieldRow(field, autoID)}
        </Fragment>
      ))}
      <div className={classes.optionalWrapper}>
        {optionalFields.map((field, index) => (
          <Fragment key={index}>{generateOptionalFieldRow(field)}</Fragment>
        ))}
      </div>
    </>
  );
};

export default CreateFields;
