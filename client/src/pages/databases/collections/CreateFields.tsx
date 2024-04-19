import {
  makeStyles,
  Theme,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import { FC, Fragment, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '@/components/customSelector/CustomSelector';
import icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import {
  generateId,
  getCreateFieldType,
  checkEmptyValid,
  checkRange,
  getCheckResult,
} from '@/utils';
import {
  ALL_OPTIONS,
  PRIMARY_FIELDS_OPTIONS,
  VECTOR_FIELDS_OPTIONS,
} from './Constants';
import { CreateFieldsProps, CreateFieldType, FieldType } from './Types';
import { DataTypeEnum, VectorTypes } from '@/consts';
import {
  DEFAULT_ATTU_DIM,
  DEFAULT_ATTU_MAX_CAPACITY,
  DEFAULT_ATTU_VARCHAR_MAX_LENGTH,
  DEFAULT_ATTU_ELEMENT_TYPE,
} from '@/consts';

const useStyles = makeStyles((theme: Theme) => ({
  optionalWrapper: {
    width: '100%',
    paddingRight: theme.spacing(1),
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
    width: '170px',
  },
  select: {
    width: '180px',
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
    position: 'relative',
    top: '-8px',
  },
  helperText: {
    lineHeight: '20px',
    fontSize: '10px',
    margin: theme.spacing(0),
    marginLeft: '11px',
  },
  toggle: {
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  icon: {
    fontSize: '14px',
    marginLeft: theme.spacing(0.5),
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
          requiredFields: [] as FieldType[],
          optionalFields: [] as FieldType[],
        }
      ),

    [fields]
  );

  const getSelector = (
    type: 'all' | 'vector' | 'element' | 'primaryKey',
    label: string,
    value: number,
    onChange: (value: DataTypeEnum) => void
  ) => {
    let _options = ALL_OPTIONS;
    switch (type) {
      case 'primaryKey':
        _options = PRIMARY_FIELDS_OPTIONS;
        break;
      case 'all':
        _options = ALL_OPTIONS;
        break;
      case 'vector':
        _options = VECTOR_FIELDS_OPTIONS;
        break;
      case 'element':
        _options = ALL_OPTIONS.filter(
          d => d.label !== 'Array' && d.label !== 'JSON'
        );
        break;
      default:
        break;
    }

    return (
      <CustomSelector
        wrapperClass={classes.select}
        options={_options}
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
    field: FieldType,
    label?: string,
    className?: string
  ) => {
    const defaultLabal = collectionTrans(
      VectorTypes.includes(field.data_type) ? 'vectorFieldName' : 'fieldName'
    );

    return getInput({
      label: label || defaultLabal,
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

  const generateDesc = (field: FieldType) => {
    return getInput({
      label: collectionTrans('description'),
      value: field.description,
      handleChange: (value: string) =>
        changeFields(field.id!, 'description', value),
      inputClassName: classes.descInput,
    });
  };

  const generateDimension = (field: FieldType) => {
    // sparse dont support dimension
    if (field.data_type === DataTypeEnum.SparseFloatVector) {
      return null;
    }
    const validateDimension = (value: string) => {
      const isPositive = getCheckResult({
        value,
        rule: 'positiveNumber',
      });
      const isMultiple = getCheckResult({
        value,
        rule: 'multiple',
        extraParam: {
          multipleNumber: 8,
        },
      });
      if (field.data_type === DataTypeEnum.BinaryVector) {
        return {
          isMultiple,
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
        const { isPositive, isMultiple } = validateDimension(value);
        const isValid =
          field.data_type === DataTypeEnum.BinaryVector
            ? !!isMultiple && isPositive
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
        const { isPositive, isMultiple } = validateDimension(value);
        if (isMultiple === false) {
          return collectionTrans('dimensionMultipleWarning');
        }

        return isPositive ? ' ' : collectionTrans('dimensionPositiveWarning');
      },
    });
  };

  const generateMaxLength = (field: FieldType) => {
    // update data if needed
    if (typeof field.max_length === 'undefined') {
      changeFields(field.id!, 'max_length', DEFAULT_ATTU_VARCHAR_MAX_LENGTH);
    }
    return getInput({
      label: 'Max Length',
      value: field.max_length! || DEFAULT_ATTU_VARCHAR_MAX_LENGTH,
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

  const generateMaxCapacity = (field: FieldType) => {
    return getInput({
      label: 'Max Capacity',
      value: field.max_capacity || DEFAULT_ATTU_MAX_CAPACITY,
      type: 'number',
      inputClassName: classes.maxLength,
      handleChange: (value: string) =>
        changeFields(field.id!, 'max_capacity', value),
      validate: (value: any) => {
        if (value === null) return ' ';
        const isEmptyValid = checkEmptyValid(value);
        const isRangeValid = checkRange({
          value,
          min: 1,
          max: 4096,
          type: 'number',
        });
        return !isEmptyValid
          ? warningTrans('requiredOnly')
          : !isRangeValid
          ? warningTrans('range', {
              min: 1,
              max: 4096,
            })
          : ' ';
      },
    });
  };

  const generatePartitionKeyToggle = (
    field: FieldType,
    fields: FieldType[]
  ) => {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={!!field.is_partition_key}
            disabled={
              fields.some(f => f.is_partition_key) && !field.is_partition_key
            }
            size="small"
            onChange={() => {
              changeFields(
                field.id!,
                'is_partition_key',
                !field.is_partition_key
              );
            }}
          />
        }
        label={
          <CustomToolTip
            title={collectionTrans('partitionKeyTooltip')}
            placement="top"
          >
            <>
              {collectionTrans('partitionKey')}
              {/* <InfoIcon classes={{ root: classes.icon }} /> */}
            </>
          </CustomToolTip>
        }
        className={classes.toggle}
      />
    );
  };

  const changeFields = (id: string, key: keyof FieldType, value: any) => {
    const newFields = fields.map(f => {
      if (f.id !== id) {
        return f;
      }

      const updatedField = {
        ...f,
        [key]: value,
      };

      // remove array params, if not array
      if (updatedField.data_type !== DataTypeEnum.Array) {
        delete updatedField.max_capacity;
        delete updatedField.element_type;
      }

      // remove varchar params, if not varchar
      if (
        updatedField.data_type !== DataTypeEnum.VarChar &&
        updatedField.element_type !== DataTypeEnum.VarChar
      ) {
        delete updatedField.max_length;
      }

      // remove dimension, if not vector
      if (
        !VectorTypes.includes(updatedField.data_type) ||
        updatedField.data_type === DataTypeEnum.SparseFloatVector
      ) {
        delete updatedField.dimension;
      } else {
        // add dimension if not exist
        updatedField.dimension = Number(
          updatedField.dimension || DEFAULT_ATTU_DIM
        );
      }

      return updatedField;
    });

    setFields(newFields);
  };

  const handleAddNewField = (index: number) => {
    const id = generateId();
    const newDefaultItem: FieldType = {
      name: '',
      data_type: DataTypeEnum.Int16,
      is_primary_key: false,
      description: '',
      isDefault: false,
      dimension: DEFAULT_ATTU_DIM,
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
    field: FieldType,
    autoID: boolean
  ): ReactElement => {
    const isVarChar = field.data_type === DataTypeEnum.VarChar;
    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field, collectionTrans('idFieldName'))}
        {getSelector(
          'primaryKey',
          `${collectionTrans('idType')} `,
          field.data_type,
          (value: DataTypeEnum) => {
            changeFields(field.id!, 'data_type', value);
            if (value === DataTypeEnum.VarChar) {
              setAutoID(false);
            }
          }
        )}
        {generateDesc(field)}

        {isVarChar && generateMaxLength(field)}

        <FormControlLabel
          control={
            <Switch
              checked={autoID}
              disabled={isVarChar}
              size="small"
              onChange={() => {
                changeFields(field.id!, 'autoID', !autoID);
                setAutoID(!autoID);
              }}
            />
          }
          label={
            <CustomToolTip
              title={collectionTrans('autoIdToggleTip')}
              placement="top"
            >
              <>{collectionTrans('autoId')}</>
            </CustomToolTip>
          }
          className={classes.toggle}
        />
      </div>
    );
  };

  const generateDefaultVectorRow = (
    field: FieldType,
    index: number
  ): ReactElement => {
    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field)}
        {getSelector(
          'vector',
          `${collectionTrans('vectorType')} `,
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id!, 'data_type', value)
        )}
        {generateDimension(field)}
        {generateDesc(field)}
        <IconButton
          onClick={() => handleAddNewField(index)}
          classes={{ root: classes.iconBtn }}
          aria-label="add"
        >
          <AddIcon />
        </IconButton>
      </div>
    );
  };

  const generateNonRequiredRow = (
    field: FieldType,
    index: number,
    fields: FieldType[]
  ): ReactElement => {
    const isVarChar = field.data_type === DataTypeEnum.VarChar;
    const isInt64 = field.data_type === DataTypeEnum.Int64;
    const isArray = field.data_type === DataTypeEnum.Array;
    const isElementVarChar = field.element_type === DataTypeEnum.VarChar;

    // handle default values
    if (isArray && typeof field.element_type === 'undefined') {
      changeFields(field.id!, 'element_type', DEFAULT_ATTU_ELEMENT_TYPE);
    }
    if (isArray && typeof field.max_capacity === 'undefined') {
      changeFields(field.id!, 'max_capacity', DEFAULT_ATTU_MAX_CAPACITY);
    }

    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field)}
        {getSelector(
          'all',
          collectionTrans('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id!, 'data_type', value)
        )}

        {isArray
          ? getSelector(
              'element',
              collectionTrans('elementType'),
              field.element_type || DEFAULT_ATTU_ELEMENT_TYPE,
              (value: DataTypeEnum) =>
                changeFields(field.id!, 'element_type', value)
            )
          : null}

        {isArray ? generateMaxCapacity(field) : null}
        {isVarChar || isElementVarChar ? generateMaxLength(field) : null}

        {generateDesc(field)}

        {isVarChar || isInt64
          ? generatePartitionKeyToggle(field, fields)
          : null}
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

  const generateVectorRow = (field: FieldType, index: number) => {
    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field)}
        {getSelector(
          'all',
          collectionTrans('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id!, 'data_type', value)
        )}

        {generateDimension(field)}
        {generateDesc(field)}

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

  const generateRequiredFieldRow = (
    field: FieldType,
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

  const generateOptionalFieldRow = (
    field: FieldType,
    index: number,
    fields: FieldType[]
  ) => {
    // optional type is vector or number
    if (field.createType === 'vector') {
      return generateVectorRow(field, index);
    }

    // use number as default createType
    return generateNonRequiredRow(field, index, fields);
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
            {generateOptionalFieldRow(
              field,
              index + requiredFields.length,
              optionalFields
            )}
          </Fragment>
        ))}
      </div>
    </>
  );
};

export default CreateFields;
