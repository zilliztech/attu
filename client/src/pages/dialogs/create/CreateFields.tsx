import { Theme, IconButton, Typography } from '@mui/material';
import { FC, Fragment, ReactElement, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import icons from '@/components/icons/Icons';
import { generateId, getCreateFieldType } from '@/utils';
import { DataTypeEnum, VectorTypes } from '@/consts';
import { DEFAULT_ATTU_DIM, DEFAULT_ATTU_VARCHAR_MAX_LENGTH } from '@/consts';
import { makeStyles } from '@mui/styles';
import type {
  CreateFieldsProps,
  CreateFieldType,
  FieldType,
} from '../../databases/collections/Types';
import NameField from './NameField';
import DimensionField from './DimensionField';
import DescriptionField from './DescriptionField';
import VectorTypeSelector from './VectorTypeSelector';
import PrimaryKeyFieldRow from './PrimaryKeyFieldRow';
import ScalarFieldRow from './ScalarFieldRow';
import FunctionFieldRow from './FunctionFieldRow';
import VectorFieldRow from './VectorFieldRow';

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

const CreateFields: FC<CreateFieldsProps> = ({
  fields,
  setFields,
  setAutoID,
  autoID,
}) => {
  // i18n
  const { t: collectionTrans } = useTranslation('collection');

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

    fields.splice(index + 1, 0, newDefaultItem);
    setFields([...fields]);
  };

  const handleRemoveField = (id: string) => {
    const newFields = fields.filter(f => f.id !== id);
    setFields(newFields);
  };

  const generateDefaultVectorRow = (
    field: FieldType,
    index: number
  ): ReactElement => {
    return (
      <div className={`${classes.rowWrapper}`}>
        <NameField
          field={field}
          onChange={(id, name) => changeFields(field.id!, { name: name })}
        />
        <VectorTypeSelector
          value={field.data_type}
          onChange={(value: DataTypeEnum) =>
            changeFields(field.id!, { data_type: value })
          }
          className={classes.select}
        />

        <DimensionField
          field={field}
          onChange={changeFields}
          inputClassName={classes.numberBox}
        />
        <DescriptionField
          field={field}
          onChange={(id, description) => changeFields(id, { description })}
          className={classes.descInput}
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

  const generateVectorRow = (field: FieldType, index: number) => {
    return (
      <div className={`${classes.rowWrapper}`}>
        <NameField
          field={field}
          onChange={(id, name) => changeFields(field.id!, { name: name })}
        />
        <VectorTypeSelector
          value={field.data_type}
          onChange={(value: DataTypeEnum) =>
            changeFields(field.id!, { data_type: value })
          }
          className={classes.select}
        />

        <DimensionField
          field={field}
          onChange={changeFields}
          inputClassName={classes.numberBox}
        />
        <DescriptionField
          field={field}
          onChange={(id, description) => changeFields(id, { description })}
          className={classes.descInput}
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
      return (
        <PrimaryKeyFieldRow
          field={field}
          autoID={autoID}
          onFieldChange={changeFields}
          setAutoID={setAutoID}
        />
      );
    }

    if (field.data_type === DataTypeEnum.VarCharBM25) {
      return (
        <FunctionFieldRow
          field={field}
          index={index}
          fields={fields}
          requiredFields={requiredFields}
          onFieldChange={changeFields}
          onAddField={handleAddNewField}
          onRemoveField={handleRemoveField}
          localFieldAnalyzers={localFieldAnalyzers}
        />
      );
    }

    if (field.createType === 'defaultVector') {
      return (
        <VectorFieldRow
          field={field}
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
      </div>
    </>
  );
};

export default CreateFields;
