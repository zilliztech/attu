import {
  Theme,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { FC, Fragment, ReactElement, useMemo, useContext } from 'react';
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
  getAnalyzerParams,
} from '@/utils';
import { rootContext } from '@/context';
import {
  ALL_OPTIONS,
  PRIMARY_FIELDS_OPTIONS,
  VECTOR_FIELDS_OPTIONS,
  ANALYZER_OPTIONS,
} from './Constants';
import {
  CreateFieldsProps,
  CreateFieldType,
  FieldType,
} from '../../databases/collections/Types';
import { DataTypeEnum, VectorTypes } from '@/consts';
import {
  DEFAULT_ATTU_DIM,
  DEFAULT_ATTU_MAX_CAPACITY,
  DEFAULT_ATTU_VARCHAR_MAX_LENGTH,
  DEFAULT_ATTU_ELEMENT_TYPE,
} from '@/consts';
import { makeStyles } from '@mui/styles';
import CustomIconButton from '@/components/customButton/CustomIconButton';
import EditAnalyzerDialog from '@/pages/dialogs/EditAnalyzerDialog';

const useStyles = makeStyles((theme: Theme) => ({
  scalarFieldsWrapper: {
    width: '100%',
    paddingRight: theme.spacing(1),
    overflowY: 'auto',
  },
  title: {
    fontSize: 14,
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(1.5),
    '& button': {
      position: 'relative',
      top: '-1px',
      marginLeft: 4,
    },
  },
  rowWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
    marginBottom: 4,
    '& .MuiFormLabel-root': {
      fontSize: 14,
    },
    '& .MuiInputBase-root': {
      fontSize: 14,
    },
    '& .MuiSelect-filled': {
      fontSize: 14,
    },
    '& .MuiCheckbox-root': {
      padding: 4,
    },
    '& .MuiFormControlLabel-label': {
      fontSize: 14,
    },
  },
  fieldInput: {
    width: '130px',
  },
  select: {
    width: '150px',
    marginTop: '-20px',
  },
  smallSelect: {
    width: '105px',
    marginTop: '-20px',
  },
  autoIdSelect: {
    width: '120px',
    marginTop: '-20px',
  },
  numberBox: {
    width: '80px',
  },
  maxLength: {
    maxWidth: '80px',
  },
  descInput: {
    width: '64px',
  },
  btnTxt: {
    textTransform: 'uppercase',
  },
  iconBtn: {
    padding: 0,
    position: 'relative',
    top: '-8px',
    '& svg': {
      width: 15,
    },
  },
  helperText: {
    lineHeight: '20px',
    fontSize: '10px',
    margin: theme.spacing(0),
    marginLeft: '11px',
  },
  toggle: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  icon: {
    fontSize: '14px',
    marginLeft: theme.spacing(0.5),
  },
  paramsGrp: {
    border: `1px dashed ${theme.palette.divider}`,
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 8,
    minHeight: 44,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  analyzerInput: {
    paddingTop: 8,
    '& .select': {
      width: '110px',
    },
  },
  setting: { fontSize: 12, alignItems: 'center', display: 'flex' },
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
  const { setDialog2, handleCloseDialog2 } = useContext(rootContext);

  const { t: collectionTrans } = useTranslation('collection');
  const { t: warningTrans } = useTranslation('warning');

  const classes = useStyles();

  const AddIcon = icons.addOutline;
  const RemoveIcon = icons.remove;

  const { requiredFields, scalarFields } = useMemo(
    () =>
      fields.reduce(
        (acc, field) => {
          const createType: CreateFieldType = getCreateFieldType(field);
          const requiredTypes: CreateFieldType[] = [
            'primaryKey',
            'defaultVector',
            'vector',
          ];
          const key = requiredTypes.includes(createType)
            ? 'requiredFields'
            : 'scalarFields';

          acc[key].push({
            ...field,
            createType,
          });

          return acc;
        },
        {
          requiredFields: [] as FieldType[],
          scalarFields: [] as FieldType[],
        }
      ),

    [fields]
  );

  const getSelector = (
    type: 'scalar' | 'vector' | 'element' | 'primaryKey',
    label: string,
    value: number,
    onChange: (value: DataTypeEnum) => void,
    className: string = classes.select
  ) => {
    let _options = ALL_OPTIONS;
    switch (type) {
      case 'primaryKey':
        _options = PRIMARY_FIELDS_OPTIONS;
        break;
      case 'scalar':
        _options = ALL_OPTIONS;
        break;
      case 'vector':
        _options = VECTOR_FIELDS_OPTIONS;
        break;
      case 'element':
        _options = ALL_OPTIONS.filter(
          d =>
            d.label !== 'Array' &&
            d.label !== 'JSON' &&
            d.label !== 'VarChar(BM25)' &&
            !d.label.includes('Vector')
        );
        break;
      default:
        break;
    }

    return (
      <CustomSelector
        wrapperClass={className}
        options={_options}
        size="small"
        onChange={e => {
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
    const defaultLabel = collectionTrans(
      VectorTypes.includes(field.data_type) ? 'vectorFieldName' : 'fieldName'
    );

    return getInput({
      label: label || defaultLabel,
      value: field.name,
      className: `${classes.fieldInput} ${className}`,
      handleChange: (value: string) => {
        const isValid = checkEmptyValid(value);
        setFieldsValidation(v =>
          v.map(item =>
            item.id === field.id! ? { ...item, name: isValid } : item
          )
        );

        changeFields(field.id!, { name: value });
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
        changeFields(field.id!, { description: value }),
      inputClassName: classes.descInput,
    });
  };

  const generateDefaultValue = (field: FieldType) => {
    let type: 'number' | 'text' = 'number';
    switch (field.data_type) {
      case DataTypeEnum.Int8:
      case DataTypeEnum.Int16:
      case DataTypeEnum.Int32:
      case DataTypeEnum.Int64:
      case DataTypeEnum.Float:
      case DataTypeEnum.Double:
        type = 'number';
        break;
      case DataTypeEnum.Bool:
        type = 'text';
        break;
      default:
        type = 'text';
        break;
    }

    return getInput({
      label: collectionTrans('defaultValue'),
      value: field.default_value,
      type: type,
      handleChange: (value: string) =>
        changeFields(field.id!, { default_value: value }),
      inputClassName: classes.descInput,
    });
  };

  const generateDimension = (field: FieldType) => {
    // sparse doesn't support dimension
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
      value: field.dim as number,
      inputClassName: classes.numberBox,
      handleChange: (value: string) => {
        const { isPositive, isMultiple } = validateDimension(value);
        const isValid =
          field.data_type === DataTypeEnum.BinaryVector
            ? !!isMultiple && isPositive
            : isPositive;

        changeFields(field.id!, { dim: value });

        setFieldsValidation(v =>
          v.map(item =>
            item.id === field.id! ? { ...item, dim: isValid } : item
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
      changeFields(field.id!, { max_length: DEFAULT_ATTU_VARCHAR_MAX_LENGTH });
    }
    return getInput({
      label: 'Max Length',
      value: field.max_length! || DEFAULT_ATTU_VARCHAR_MAX_LENGTH,
      type: 'number',
      inputClassName: classes.maxLength,
      handleChange: (value: string) =>
        changeFields(field.id!, { max_length: value }),
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
        changeFields(field.id!, { max_capacity: value }),
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

  const generatePartitionKeyCheckbox = (
    field: FieldType,
    fields: FieldType[]
  ) => {
    return (
      <div className={classes.setting}>
        <Checkbox
          checked={!!field.is_partition_key}
          size="small"
          disabled={
            (fields.some(f => f.is_partition_key) && !field.is_partition_key) ||
            field.nullable
          }
          onChange={() => {
            changeFields(field.id!, {
              is_partition_key: !field.is_partition_key,
            });
          }}
        />
        <CustomToolTip
          title={collectionTrans('partitionKeyTooltip')}
          placement="top"
        >
          <>{collectionTrans('partitionKey')}</>
        </CustomToolTip>
      </div>
    );
  };

  const generateNullableCheckbox = (field: FieldType, fields: FieldType[]) => {
    return (
      <div className={classes.setting}>
        <Checkbox
          checked={!!field.nullable}
          size="small"
          onChange={() => {
            changeFields(field.id!, {
              nullable: !field.nullable,
              is_partition_key: false,
            });
          }}
        />
        <CustomToolTip
          title={collectionTrans('nullableTooltip')}
          placement="top"
        >
          <>{collectionTrans('nullable')}</>
        </CustomToolTip>
      </div>
    );
  };

  const generateTextMatchCheckBox = (field: FieldType, fields: FieldType[]) => {
    const update: Partial<FieldType> = {
      enable_match: !field.enable_match,
    };

    if (!field.enable_match) {
      update.enable_analyzer = true;
    }
    return (
      <div className={classes.setting}>
        <Checkbox
          checked={!!field.enable_match}
          size="small"
          onChange={() => {
            changeFields(field.id!, update);
          }}
        />
        <CustomToolTip
          title={collectionTrans('textMatchTooltip')}
          placement="top"
        >
          <>{collectionTrans('enableMatch')}</>
        </CustomToolTip>
      </div>
    );
  };

  const generateAnalyzerCheckBox = (field: FieldType, fields: FieldType[]) => {
    let analyzer = '';
    if (typeof field.analyzer_params === 'object') {
      analyzer = field.analyzer_params.tokenizer || field.analyzer_params.type;
    } else {
      analyzer = field.analyzer_params || 'standard';
    }

    return (
      <div className={classes.analyzerInput}>
        <Checkbox
          checked={
            !!field.enable_analyzer ||
            field.data_type === DataTypeEnum.VarCharBM25
          }
          size="small"
          onChange={() => {
            changeFields(field.id!, {
              enable_analyzer: !field.enable_analyzer,
            });
          }}
          disabled={field.data_type === DataTypeEnum.VarCharBM25}
        />
        <CustomSelector
          wrapperClass="select"
          options={ANALYZER_OPTIONS}
          size="small"
          onChange={e => {
            changeFields(field.id!, { analyzer_params: e.target.value });
          }}
          disabled={
            !field.enable_analyzer &&
            field.data_type !== DataTypeEnum.VarCharBM25
          }
          value={analyzer}
          variant="filled"
          label={collectionTrans('analyzer')}
        />
        <CustomIconButton
          disabled={
            !field.enable_analyzer &&
            field.data_type !== DataTypeEnum.VarCharBM25
          }
          onClick={() => {
            setDialog2({
              open: true,
              type: 'custom',
              params: {
                component: (
                  <EditAnalyzerDialog
                    data={getAnalyzerParams(
                      field.analyzer_params || 'standard'
                    )}
                    handleConfirm={data => {
                      changeFields(field.id!, { analyzer_params: data });
                    }}
                    handleCloseDialog={handleCloseDialog2}
                  />
                ),
              },
            });
          }}
        >
          <icons.settings className={classes.icon} />
        </CustomIconButton>
      </div>
    );
  };

  const changeFields = (id: string, changes: Partial<FieldType>) => {
    const newFields = fields.map(f => {
      if (f.id !== id) {
        return f;
      }

      const updatedField = {
        ...f,
        ...changes,
      };

      // remove array params, if not array
      if (updatedField.data_type !== DataTypeEnum.Array) {
        delete updatedField.max_capacity;
        delete updatedField.element_type;
      }

      // remove varchar params, if not varchar
      if (
        updatedField.data_type !== DataTypeEnum.VarChar &&
        updatedField.data_type !== DataTypeEnum.VarCharBM25 &&
        updatedField.element_type !== DataTypeEnum.VarChar
      ) {
        delete updatedField.max_length;
      }

      // remove dimension, if not vector
      if (
        !VectorTypes.includes(updatedField.data_type) ||
        updatedField.data_type === DataTypeEnum.SparseFloatVector
      ) {
        delete updatedField.dim;
      } else {
        // add dimension if not exist
        updatedField.dim = Number(updatedField.dim || DEFAULT_ATTU_DIM);
      }

      return updatedField;
    });

    setFields(newFields);
  };

  const handleAddNewField = (index: number, type = DataTypeEnum.Int16) => {
    const id = generateId();
    const newDefaultItem: FieldType = {
      name: '',
      data_type: type,
      is_primary_key: false,
      description: '',
      isDefault: false,
      dim: DEFAULT_ATTU_DIM,
      max_length: DEFAULT_ATTU_VARCHAR_MAX_LENGTH,
      enable_analyzer: type === DataTypeEnum.VarCharBM25,
      id,
    };
    const newValidation = {
      id,
      name: false,
      dim: true,
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
            changeFields(field.id!, { data_type: value });
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
                changeFields(field.id!, { autoID: !autoID });
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
          (value: DataTypeEnum) => changeFields(field.id!, { data_type: value })
        )}
        {generateDimension(field)}
        {generateDesc(field)}
        <IconButton
          onClick={() => handleAddNewField(index, field.data_type)}
          classes={{ root: classes.iconBtn }}
          aria-label="add"
          size="large"
        >
          <AddIcon />
        </IconButton>
      </div>
    );
  };

  const generateScalarFieldRow = (
    field: FieldType,
    index: number,
    fields: FieldType[]
  ): ReactElement => {
    const isVarChar = field.data_type === DataTypeEnum.VarChar;
    const isInt64 = field.data_type === DataTypeEnum.Int64;
    const isArray = field.data_type === DataTypeEnum.Array;
    const isElementVarChar = field.element_type === DataTypeEnum.VarChar;
    const showDefaultValue =
      field.data_type !== DataTypeEnum.Array &&
      field.data_type !== DataTypeEnum.JSON;

    // handle default values
    if (isArray && typeof field.element_type === 'undefined') {
      changeFields(field.id!, { element_type: DEFAULT_ATTU_ELEMENT_TYPE });
    }
    if (isArray && typeof field.max_capacity === 'undefined') {
      changeFields(field.id!, { max_capacity: DEFAULT_ATTU_MAX_CAPACITY });
    }

    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field)}
        {getSelector(
          'scalar',
          collectionTrans('fieldType'),
          field.data_type,
          (value: DataTypeEnum) =>
            changeFields(field.id!, { data_type: value }),
          classes.smallSelect
        )}

        {isArray
          ? getSelector(
              'element',
              collectionTrans('elementType'),
              field.element_type || DEFAULT_ATTU_ELEMENT_TYPE,
              (value: DataTypeEnum) =>
                changeFields(field.id!, { element_type: value }),
              classes.smallSelect
            )
          : null}

        {isArray ? generateMaxCapacity(field) : null}
        {isVarChar || isElementVarChar ? generateMaxLength(field) : null}

        {showDefaultValue && generateDefaultValue(field)}

        {generateDesc(field)}

        <div className={classes.paramsGrp}>
          {isInt64 ? generatePartitionKeyCheckbox(field, fields) : null}

          {isVarChar ? (
            <>
              {generateAnalyzerCheckBox(field, fields)}
              {generateTextMatchCheckBox(field, fields)}
              {generatePartitionKeyCheckbox(field, fields)}
            </>
          ) : null}
          {generateNullableCheckbox(field, fields)}
        </div>

        <IconButton
          onClick={() => {
            handleAddNewField(index, field.data_type);
          }}
          classes={{ root: classes.iconBtn }}
          aria-label="add"
          size="large"
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
          size="large"
        >
          <RemoveIcon />
        </IconButton>
      </div>
    );
  };

  const generateFunctionRow = (
    field: FieldType,
    index: number,
    fields: FieldType[],
    requiredFields: FieldType[]
  ) => {
    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field)}
        {getSelector(
          'vector',
          collectionTrans('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id!, { data_type: value })
        )}

        {generateMaxLength(field)}
        {generateDefaultValue(field)}
        {generateDesc(field)}

        <div className={classes.paramsGrp}>
          {generateAnalyzerCheckBox(field, fields)}
          {generateTextMatchCheckBox(field, fields)}
          {generatePartitionKeyCheckbox(field, fields)}
          {generateNullableCheckbox(field, fields)}
        </div>

        <IconButton
          onClick={() => {
            handleAddNewField(index, field.data_type);
          }}
          classes={{ root: classes.iconBtn }}
          aria-label="add"
          size="large"
        >
          <AddIcon />
        </IconButton>

        {requiredFields.length !== 2 && (
          <IconButton
            onClick={() => {
              const id = field.id || '';
              handleRemoveField(id);
            }}
            classes={{ root: classes.iconBtn }}
            aria-label="delete"
            size="large"
          >
            <RemoveIcon />
          </IconButton>
        )}
      </div>
    );
  };

  const generateVectorRow = (field: FieldType, index: number) => {
    return (
      <div className={`${classes.rowWrapper}`}>
        {generateFieldName(field)}
        {getSelector(
          'vector',
          `${collectionTrans('vectorType')} `,
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id!, { data_type: value })
        )}

        {generateDimension(field)}
        {generateDesc(field)}

        <IconButton
          onClick={() => handleAddNewField(index, field.data_type)}
          classes={{ root: classes.iconBtn }}
          aria-label="add"
          size="large"
        >
          <AddIcon />
        </IconButton>
        {requiredFields.length !== 2 && (
          <IconButton
            onClick={() => {
              const id = field.id || '';
              handleRemoveField(id);
            }}
            classes={{ root: classes.iconBtn }}
            aria-label="delete"
            size="large"
          >
            <RemoveIcon />
          </IconButton>
        )}
      </div>
    );
  };

  const generateRequiredFieldRow = (
    field: FieldType,
    autoID: boolean,
    index: number,
    fields: FieldType[],
    requiredFields: FieldType[]
  ) => {
    // required type is primaryKey or defaultVector
    if (field.createType === 'primaryKey') {
      return generatePrimaryKeyRow(field, autoID);
    }

    if (field.data_type === DataTypeEnum.VarCharBM25) {
      return generateFunctionRow(field, index, fields, requiredFields);
    }

    if (field.createType === 'defaultVector') {
      return generateDefaultVectorRow(field, index);
    }

    // generate other vector rows
    return generateVectorRow(field, index);
  };

  return (
    <>
      <Typography variant="h4" className={classes.title}>
        {`${collectionTrans('idAndVectorFields')}(${requiredFields.length})`}
      </Typography>
      {requiredFields.map((field, index) => (
        <Fragment key={field.id}>
          {generateRequiredFieldRow(
            field,
            autoID,
            index,
            fields,
            requiredFields
          )}
        </Fragment>
      ))}
      <Typography variant="h4" className={classes.title}>
        {`${collectionTrans('scalarFields')}(${scalarFields.length})`}
        <IconButton
          onClick={() => {
            handleAddNewField(requiredFields.length + 1);
          }}
          classes={{ root: classes.iconBtn }}
          aria-label="add"
          size="large"
        >
          <AddIcon />
        </IconButton>
      </Typography>
      <div className={classes.scalarFieldsWrapper}>
        {scalarFields.map((field, index) => (
          <Fragment key={field.id}>
            {generateScalarFieldRow(
              field,
              index + requiredFields.length,
              fields
            )}
          </Fragment>
        ))}
      </div>
    </>
  );
};

export default CreateFields;
