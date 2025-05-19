import { Box, IconButton, Typography } from '@mui/material';
import { FC, Fragment, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import icons from '@/components/icons/Icons';
import { generateId, getCreateFieldType } from '@/utils';
import { DataTypeEnum, VectorTypes } from '@/consts';
import { DEFAULT_ATTU_DIM, DEFAULT_ATTU_VARCHAR_MAX_LENGTH } from '@/consts';
import type {
  CreateFieldsProps,
  CreateFieldType,
  FieldType,
} from '../../databases/collections/Types';
import PrimaryKeyFieldRow from './rows/PrimaryKeyFieldRow';
import ScalarFieldRow from './rows/ScalarFieldRow';
import VectorFieldRow from './rows/VectorFieldRow';

const CreateFields: FC<CreateFieldsProps> = ({
  fields,
  setFields,
  onValidationChange,
}) => {
  // i18n
  const { t: collectionTrans } = useTranslation('collection');

  // UI stats
  const localFieldAnalyzers = useRef(
    new Map<string, Record<string, {}>>(new Map())
  );

  const localFieldsValidation = useRef<Map<string, boolean>>(
    new Map(
      fields
        .filter(field => field.id !== undefined)
        .map(field => [field.id!, field.name !== ''])
    )
  );

  // Add this helper function
  const updateValidationStatus = useCallback(() => {
    const areFieldsValid = Array.from(
      localFieldsValidation.current.values()
    ).every(v => v);
    onValidationChange(areFieldsValid);
  }, [onValidationChange]);

  // UI icons
  const AddIcon = icons.addOutline;

  // calculate required and scalar fields
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

  // UI handlers
  const changeFields = (
    id: string,
    changes: Partial<FieldType>,
    isValid?: boolean
  ) => {
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

    // Update validation in ref
    if (isValid !== undefined) {
      localFieldsValidation.current.set(id, isValid);
    } else {
      localFieldsValidation.current.delete(id);
    }

    updateValidationStatus();
  };

  const getShortTypeName = (type: DataTypeEnum) => {
    switch (type) {
      case DataTypeEnum.Int8:
      case DataTypeEnum.Int16:
      case DataTypeEnum.Int32:
      case DataTypeEnum.Int64:
        return 'int';
      case DataTypeEnum.Float:
        return 'float';
      case DataTypeEnum.Double:
        return 'double';
      case DataTypeEnum.VarChar:
        return 'varchar';
      case DataTypeEnum.Bool:
        return 'bool';
      case DataTypeEnum.BinaryVector:
      case DataTypeEnum.FloatVector:
      case DataTypeEnum.Float16Vector:
      case DataTypeEnum.BFloat16Vector:
      case DataTypeEnum.SparseFloatVector:
        return 'vec';
      case DataTypeEnum.Array:
        return 'array';
      case DataTypeEnum.JSON:
        return 'json';
      default:
        return 'field';
    }
  };

  const handleAddNewField = (index: number, type = DataTypeEnum.Int16) => {
    const id = generateId();
    const shortType = getShortTypeName(type);

    let sameTypeCount = fields.filter(
      f => getShortTypeName(f.data_type) === shortType
    ).length;
    let name =
      sameTypeCount === 0 ? shortType : `${shortType}_${sameTypeCount + 1}`;

    const existingNames = new Set(fields.map(f => f.name));
    while (existingNames.has(name)) {
      sameTypeCount += 1;
      name = `${shortType}_${sameTypeCount}`;
    }

    const newDefaultItem: FieldType = {
      id,
      name,
      data_type: type,
      is_primary_key: false,
      description: '',
      isDefault: false,
      dim: DEFAULT_ATTU_DIM,
      max_length: DEFAULT_ATTU_VARCHAR_MAX_LENGTH,
      enable_analyzer: false,
    };

    fields.splice(index + 1, 0, newDefaultItem);
    setFields([...fields]);

    // Add validation to ref
    localFieldsValidation.current.set(id, true);
    updateValidationStatus();
  };

  const handleRemoveField = (id: string) => {
    const newFields = fields.filter(f => f.id !== id);
    setFields(newFields);

    // Remove validation from ref
    localFieldsValidation.current.delete(id);
    updateValidationStatus();
  };

  const generateRequiredFieldRow = (
    field: FieldType,
    index: number,
    fields: FieldType[],
    requiredFields: FieldType[]
  ) => {
    // required type is primaryKey or defaultVector
    if (field.createType === 'primaryKey') {
      return (
        <PrimaryKeyFieldRow
          field={field}
          fields={fields}
          onFieldChange={changeFields}
        />
      );
    }

    if (field.createType === 'defaultVector') {
      return (
        <VectorFieldRow
          field={field}
          fields={fields}
          index={index}
          requiredFields={requiredFields}
          onFieldChange={changeFields}
          onAddField={handleAddNewField}
          onRemoveField={handleRemoveField}
          showDeleteButton={true}
        />
      );
    }

    // generate other vector rows
    return (
      <VectorFieldRow
        field={field}
        fields={fields}
        index={index}
        requiredFields={requiredFields}
        onFieldChange={changeFields}
        onAddField={handleAddNewField}
        onRemoveField={handleRemoveField}
        showDeleteButton={true}
      />
    );
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontSize: 14,
          mb: 1.5,
        }}
      >
        {`${collectionTrans('idAndVectorFields')}(${requiredFields.length})`}
      </Typography>

      {requiredFields.map((field, index) => (
        <Fragment key={field.id}>
          {generateRequiredFieldRow(field, index, fields, requiredFields)}
        </Fragment>
      ))}

      <Typography
        variant="h4"
        sx={{
          fontSize: 14,
          mt: 2,
          mb: 1.5,
          '& button': {
            position: 'relative',
            top: '-1px',
            ml: 0.5,
          },
        }}
      >
        {`${collectionTrans('scalarFields')}(${scalarFields.length})`}
        <IconButton
          onClick={() => {
            handleAddNewField(requiredFields.length + 1);
          }}
          sx={{
            p: 0,
            position: 'relative',
            top: '-8px',
            '& svg': {
              width: 15,
            },
          }}
          aria-label="add"
          size="large"
        >
          <AddIcon />
        </IconButton>
      </Typography>

      <Box>
        {scalarFields.map((field, index) => (
          <ScalarFieldRow
            key={field.id}
            field={field}
            index={index + requiredFields.length}
            fields={fields}
            onFieldChange={changeFields}
            onAddField={handleAddNewField}
            onRemoveField={handleRemoveField}
            localFieldAnalyzers={localFieldAnalyzers}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CreateFields;
