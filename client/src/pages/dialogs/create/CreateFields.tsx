import {
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { FC, Fragment, ReactElement, useMemo, useContext, useRef } from 'react';
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
} from './Constants';

import { DataTypeEnum, VectorTypes } from '@/consts';
import {
  DEFAULT_ATTU_DIM,
  DEFAULT_ATTU_MAX_CAPACITY,
  DEFAULT_ATTU_VARCHAR_MAX_LENGTH,
  DEFAULT_ATTU_ELEMENT_TYPE,
} from '@/consts';
import type {
  CreateFieldsProps,
  CreateFieldType,
  FieldType,
} from '../../databases/collections/Types';
import { useStyles } from './styles';
import Desc from './Desc';
import TextMatchCheckBox from './TextMatchCheckBox';
import AnalyzerCheckBox from './AnalyzerCheckBox';
import DefaultValueInput from './DefaultValueInput';

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
  // context
  const { setDialog2, handleCloseDialog2 } = useContext(rootContext);

  // i18n
  const { t: collectionTrans } = useTranslation('collection');
  const { t: warningTrans } = useTranslation('warning');
  const { t: dialogTrans } = useTranslation('dialog');

  // styles
  const classes = useStyles();

  // UI stats
  const localFieldAnalyzers = useRef(
    new Map<string, Record<string, {}>>(new Map())
  );

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
    const disabled =
      (fields.some(f => f.is_partition_key) && !field.is_partition_key) ||
      field.nullable;
    return (
      <div className={classes.setting}>
        <label htmlFor="partitionKey">
          <Checkbox
            id="partitionKey"
            checked={!!field.is_partition_key}
            size="small"
            disabled={disabled}
            onChange={() => {
              changeFields(field.id!, {
                is_partition_key: !field.is_partition_key,
              });
            }}
          />
          <CustomToolTip
            title={collectionTrans(
              disabled ? 'paritionKeyDisabledTooltip' : 'partitionKeyTooltip'
            )}
            placement="top"
          >
            <>{collectionTrans('partitionKey')}</>
          </CustomToolTip>
        </label>
      </div>
    );
  };

  const generateNullableCheckbox = (field: FieldType, fields: FieldType[]) => {
    return (
      <div className={classes.setting}>
        <label htmlFor="nullable">
          <Checkbox
            id="nullable"
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
        </label>
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

        <Desc
          value={field.description}
          onChange={(value: string) => {
            changeFields(field.id!, { description: value });
          }}
        />

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
        <Desc
          value={field.description}
          onChange={(value: string) => {
            changeFields(field.id!, { description: value });
          }}
        />
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

        {showDefaultValue && (
          <DefaultValueInput
            field={field}
            onChange={(id, value) => changeFields(id, { default_value: value })}
            label="Default Value"
          />
        )}

        <Desc
          value={field.description}
          onChange={(value: string) => {
            changeFields(field.id!, { description: value });
          }}
        />

        <div className={classes.paramsGrp}>
          {isInt64 ? generatePartitionKeyCheckbox(field, fields) : null}

          {isVarChar ? (
            <>
              <AnalyzerCheckBox
                field={field}
                onChange={changeFields}
                collectionTrans={collectionTrans}
                dialogTrans={dialogTrans}
                localFieldAnalyzers={localFieldAnalyzers}
                setDialog={setDialog2}
                getAnalyzerParams={getAnalyzerParams}
              />
              <TextMatchCheckBox
                field={field}
                onChange={changeFields}
                collectionTrans={collectionTrans}
              />
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
        <DefaultValueInput
          field={field}
          onChange={(id, value) => changeFields(id, { default_value: value })}
          label="Default Value"
        />
        <Desc
          value={field.description}
          onChange={(value: string) => {
            changeFields(field.id!, { description: value });
          }}
        />

        <div className={classes.paramsGrp}>
          <AnalyzerCheckBox
            field={field}
            onChange={changeFields}
            collectionTrans={collectionTrans}
            dialogTrans={dialogTrans}
            localFieldAnalyzers={localFieldAnalyzers}
            setDialog={setDialog2}
            getAnalyzerParams={getAnalyzerParams}
          />
          <TextMatchCheckBox
            field={field}
            onChange={changeFields}
            collectionTrans={collectionTrans}
          />
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
        <Desc
          value={field.description}
          onChange={(value: string) => {
            changeFields(field.id!, { description: value });
          }}
        />

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
