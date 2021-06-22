import { makeStyles, Theme, TextField, IconButton } from '@material-ui/core';
import { FC, Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../components/customButton/CustomButton';
import CustomSelector from '../../components/customSelector/CustomSelector';
import icons from '../../components/icons/Icons';
import { generateId } from '../../utils/Common';
import { getCreateFieldType } from '../../utils/Format';
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
}));

const CreateFields: FC<CreateFieldsProps> = ({
  fields,
  setFields,
  // @TODO validation
  setfieldsAllValid,
  setAutoID,
  autoID,
}) => {
  const { t } = useTranslation('collection');
  const classes = useStyles();

  const primaryInt64Value = 'INT64 (Primary key)';
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

  const getInput = (
    label: string,
    value: string | number,
    handleChange: (value: string) => void,
    className = '',
    inputClassName = '',
    isReadOnly = false
  ) => (
    <TextField
      label={label}
      value={value}
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
      disabled={isReadOnly}
    />
  );

  const changeFields = (
    id: string,
    key: string,
    value: string | DataTypeEnum
  ) => {
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
    const newDefaultItem: Field = {
      name: '',
      data_type: DataTypeEnum.Int16,
      is_primary_key: false,
      description: '',
      isDefault: false,
      id: generateId(),
    };
    setFields([...fields, newDefaultItem]);
  };

  const handleRemoveField = (field: Field) => {
    const newFields = fields.filter(f => f.id !== field.id);
    setFields(newFields);
  };

  const generatePrimaryKeyRow = (
    field: Field,
    autoID: boolean
  ): ReactElement => {
    return (
      <div className={`${classes.rowWrapper} ${classes.mb3}`}>
        {getInput(
          t('fieldType'),
          primaryInt64Value,
          () => {},
          classes.primaryInput,
          classes.input,
          true
        )}

        {getInput(t('fieldName'), field.name, (value: string) =>
          changeFields(field.id, 'name', value)
        )}

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

        {getInput(
          t('description'),
          field.description,
          (value: string) => changeFields(field.id, 'description', value),
          classes.descInput
        )}
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

          {getInput(t('fieldName'), field.name, (value: string) =>
            changeFields(field.id, 'name', value)
          )}

          {getInput(
            t('dimension'),
            field.dimension as number,
            (value: string) => changeFields(field.id, 'dimension', value),
            'dimension'
          )}

          {getInput(
            t('description'),
            field.description,
            (value: string) => changeFields(field.id, 'description', value),
            classes.descInput
          )}
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
        {getInput(t('fieldName'), field.name, (value: string) =>
          changeFields(field.id, 'name', value)
        )}
        {getSelector(
          'all',
          t('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id, 'data_type', value)
        )}

        {getInput(
          t('description'),
          field.description,
          (value: string) => changeFields(field.id, 'description', value),
          classes.descInput
        )}
      </div>
    );
  };

  const generateVectorRow = (field: Field) => {
    return (
      <div className={`${classes.rowWrapper} ${classes.mb2}`}>
        <IconButton classes={{ root: classes.iconBtn }} aria-label="delete">
          <RemoveIcon />
        </IconButton>
        {getInput(t('fieldName'), field.name, (value: string) =>
          changeFields(field.id, 'name', value)
        )}
        {getSelector(
          'all',
          t('fieldType'),
          field.data_type,
          (value: DataTypeEnum) => changeFields(field.id, 'data_type', value)
        )}
        {getInput(
          t('dimension'),
          field.dimension as number,
          (value: string) => changeFields(field.id, 'dimension', value),
          'dimension'
        )}

        {getInput(
          t('description'),
          field.description,
          (value: string) => changeFields(field.id, 'description', value),
          classes.descInput
        )}
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
