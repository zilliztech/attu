import { makeStyles, Theme, TextField, IconButton } from '@material-ui/core';
import { FC, Fragment, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '../../components/customSelector/CustomSelector';
import icons from '../../components/icons/Icons';
import { generateId } from '../../utils/Common';
import { getCreateFieldType } from '../../utils/Format';
import {
  checkEmptyValid,
  checkRange,
  getCheckResult,
} from '../../utils/Validation';
import {
  ALL_OPTIONS,
  AUTO_ID_OPTIONS,
  PRIMARY_FIELDS_OPTIONS,
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
    gap: '8px',
    flex: '1 0 auto',
  },
  input: {
    fontSize: '14px',
  },
  fieldInput: {
    width: '160px',
  },
  select: {
    width: '140px',
    marginTop: '-20px',

    '&:first-child': {
      marginLeft: 0,
    },
  },
  autoIdSelect: {
    width: '120px',
    marginTop: '-20px',
  },
  numberBox: {
    width: '97px',
  },
  maxLength: {
    maxWidth: '80px',
  },
  descInput: {
    width: '120px',
  },
  btnTxt: {
    textTransform: 'uppercase',
  },
  iconBtn: {
    marginLeft: 0,
    padding: 0,
    width: '16px',
    height: '16px',
  },
  helperText: {
    lineHeight: '20px',
    fontSize: '10px',
    margin: theme.spacing(0),
    marginLeft: '11px',
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

  const AddIcon = icons.addOutline;
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
    onChange: (value: DataTypeEnum) => void,
    options?: any[]
  ) => {
    return (
      <CustomSelector
        wrapperClass={classes.select}
        options={
          options
            ? options
            : type === 'all'
            ? ALL_OPTIONS
            : VECTOR_FIELDS_OPTIONS
        }
        size="small"
        onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
          onChange(e.target.value as DataTypeEnum);
        }}
        value={value}
        variant="filled"
        label={label}
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
        onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
          handleChange(e.target.value as string);
        }}
        variant="filled"
        className={className}
        InputProps={{
          classes: {
            input: inputClassName,
          },
        }}
        InputLabelProps={{
          shrink: true,
        }}
        size="small"
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

  const generateFieldName = (
    field: Field,
    label?: string,
    className?: string
  ) => {
    return getInput({
      label: label || collectionTrans('fieldName'),
      value: field.name,
      className: className || classes.fieldInput,
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

        return isValid ? ' ' : warningTrans('requiredOnly');
      },
    });
  };

  const generateDesc = (field: Field) => {
    return getInput({
      label: collectionTrans('description'),
      value: field.description,
      handleChange: (value: string) =>
        changeFields(field.id!, 'description', value),
      inputClassName: classes.descInput,
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
      inputClassName: classes.numberBox,
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

  const generateMaxLength = (field: Field) => {
    return getInput({
      label: 'Max Length',
      value: field.max_length!,
      type: 'number',
      inputClassName: classes.maxLength,
      handleChange: (value: string) =>
        changeFields(field.id!, 'max_length', value),
      validate: (value: any) => {
        if (value === null) return ' ';
        const isEmptyValid = checkEmptyValid(value);
        const isRangeValid = checkRange({
          value,
          min: 1,
          max: 65535,
          type: 'number',
        });
        return !isEmptyValid
          ? warningTrans('requiredOnly')
          : !isRangeValid
          ? warningTrans('range', {
              min: 1,
              max: 65535,
            })
          : ' ';
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

  const handleAddNewField = (index: number) => {
    const id = generateId();
    const newDefaultItem: Field = {
      name: null,
      data_type: DataTypeEnum.Int16,
      is_primary_key: false,
      description: '',
      isDefault: false,
      dimension: '128',
      max_length: null,
      id,
    };
    const newValidation = {
      id,
      name: false,
      dimension: true,
    };

    fields.splice(index + 1, 0, newDefaultItem);
    setFields([...fields]);
    setFieldsValidation(v => [...v, newValidation]);
  };

  const handleRemoveField = (id: string) => {
    const newFields = fields.filter(f => f.id !== id);
    setFields(newFields);
    setFieldsValidation(v => v.filter(item => item.id !== id));
  };

  const generatePrimaryKeyRow = (
    field: Field,
    autoID: boolean
  ): ReactElement => {
    const isVarChar = field.data_type === DataTypeEnum.VarChar;
    const autoIdOff = isVarChar ? 'false' : autoID ? 'true' : 'false';
    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field, collectionTrans('idFieldName'))}
        {getSelector(
          'vector',
          `${collectionTrans('idType')} `,
          field.data_type,
          (value: DataTypeEnum) => {
            changeFields(field.id!, 'data_type', value);
            if (value === DataTypeEnum.VarChar) {
              setAutoID(false);
            }
          },
          PRIMARY_FIELDS_OPTIONS
        )}
        {generateDesc(field)}

        <CustomSelector
          label={collectionTrans('autoId')}
          options={AUTO_ID_OPTIONS}
          value={autoIdOff}
          onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
            const autoId = e.target.value === 'true';
            setAutoID(autoId);
          }}
          variant="filled"
          wrapperClass={classes.autoIdSelect}
          disabled={isVarChar}
          size="small"
        />

        {isVarChar && generateMaxLength(field)}
      </div>
    );
  };

  const generateDefaultVectorRow = (
    field: Field,
    index: number
  ): ReactElement => {
    return (
      <>
        <div className={`${classes.rowWrapper}`}>
          {generateFieldName(field, collectionTrans('vectorFieldName'))}

          {getSelector(
            'vector',
            `${collectionTrans('vectorType')} `,
            field.data_type,
            (value: DataTypeEnum) => changeFields(field.id!, 'data_type', value)
          )}
          {generateDesc(field)}

          {generateDimension(field)}

          <IconButton
            onClick={() => handleAddNewField(index)}
            classes={{ root: classes.iconBtn }}
            aria-label="add"
          >
            <AddIcon />
          </IconButton>
        </div>
      </>
    );
  };

  const generateNumberRow = (field: Field, index: number): ReactElement => {
    const isVarChar = field.data_type === DataTypeEnum.VarChar;
    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field)}
        {getSelector(
          'all',
          collectionTrans('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id!, 'data_type', value)
        )}
        {generateDesc(field)}

        {isVarChar && generateMaxLength(field)}
        <IconButton
          onClick={() => {
            handleAddNewField(index);
          }}
          classes={{ root: classes.iconBtn }}
          aria-label="add"
        >
          <AddIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            const id = field.id || '';
            handleRemoveField(id);
          }}
          classes={{ root: classes.iconBtn }}
          aria-label="delete"
        >
          <RemoveIcon />
        </IconButton>
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

  const generateRequiredFieldRow = (
    field: Field,
    autoID: boolean,
    index: number
  ) => {
    // required type is primaryKey or defaultVector
    if (field.createType === 'primaryKey') {
      return generatePrimaryKeyRow(field, autoID);
    }
    // use defaultVector as default return type
    return generateDefaultVectorRow(field, index);
  };

  const generateOptionalFieldRow = (field: Field, index: number) => {
    // optional type is vector or number
    if (field.createType === 'vector') {
      return generateVectorRow(field);
    }

    // use number as default createType
    return generateNumberRow(field, index);
  };

  return (
    <>
      {requiredFields.map((field, index) => (
        <Fragment key={field.id}>
          {generateRequiredFieldRow(field, autoID, index)}
        </Fragment>
      ))}
      <div className={classes.optionalWrapper}>
        {optionalFields.map((field, index) => (
          <Fragment key={field.id}>
            {generateOptionalFieldRow(field, index + requiredFields.length)}
          </Fragment>
        ))}
      </div>
    </>
  );
};

export default CreateFields;
