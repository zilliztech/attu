import { FC, MutableRefObject } from 'react';
import { IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import icons from '@/components/icons/Icons';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../../databases/collections/Types';
import NameField from '../NameField';
import VectorTypeSelector from '../VectorTypeSelector';
import MaxLengthField from '../MaxLengthField';
import DefaultValueField from '../DefaultValueField';
import DescriptionField from '../DescriptionField';
import AnalyzerCheckboxField from '../AnalyzerCheckboxField';
import TextMatchCheckboxField from '../TextMatchCheckboxField';
import PartitionKeyCheckboxField from '../PartitionKeyCheckboxField';
import NullableCheckboxField from '../NullableCheckboxField';

interface FunctionFieldRowProps {
  field: FieldType;
  index: number;
  fields: FieldType[];
  requiredFields: FieldType[];
  onFieldChange: (id: string, changes: Partial<FieldType>) => void;
  onAddField: (index: number, type: DataTypeEnum) => void;
  onRemoveField: (id: string) => void;
  localFieldAnalyzers: MutableRefObject<Map<string, Record<string, {}>>>;
  className?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
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
  select: {
    width: '150px',
    marginTop: '-20px',
  },
  maxLength: {
    maxWidth: '80px',
  },
  descInput: {
    width: '64px',
  },
  iconBtn: {
    padding: 0,
    position: 'relative',
    top: '-8px',
    '& svg': {
      width: 15,
    },
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
  setting: {
    fontSize: 12,
    alignItems: 'center',
    display: 'flex',
  },
}));

const FunctionFieldRow: FC<FunctionFieldRowProps> = ({
  field,
  index,
  fields,
  requiredFields,
  onFieldChange,
  onAddField,
  onRemoveField,
  localFieldAnalyzers,
  className,
}) => {
  const classes = useStyles();
  const { t: collectionTrans } = useTranslation('collection');

  const AddIcon = icons.addOutline;
  const RemoveIcon = icons.remove;

  return (
    <div className={`${classes.rowWrapper} ${className || ''}`}>
      <NameField
        field={field}
        onChange={(id, name) => onFieldChange(field.id!, { name: name })}
      />
      <VectorTypeSelector
        value={field.data_type}
        onChange={(value: DataTypeEnum) =>
          onFieldChange(field.id!, { data_type: value })
        }
        className={classes.select}
      />

      <MaxLengthField
        field={field}
        onChange={onFieldChange}
        inputClassName={classes.maxLength}
      />
      <DefaultValueField
        field={field}
        onChange={(id, defaultValue) =>
          onFieldChange(id, { default_value: defaultValue })
        }
        className={classes.descInput}
        label={collectionTrans('defaultValue')}
      />
      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description })}
        className={classes.descInput}
      />

      <div className={classes.paramsGrp}>
        <AnalyzerCheckboxField
          field={field}
          onChange={onFieldChange}
          localFieldAnalyzers={localFieldAnalyzers}
        />
        <TextMatchCheckboxField
          field={field}
          onChange={onFieldChange}
          className={classes.setting}
        />
        <PartitionKeyCheckboxField
          field={field}
          fields={fields}
          onChange={onFieldChange}
          className={classes.setting}
        />
        <NullableCheckboxField
          field={field}
          onChange={onFieldChange}
          className={classes.setting}
        />
      </div>

      <IconButton
        onClick={() => onAddField(index, field.data_type)}
        classes={{ root: classes.iconBtn }}
        aria-label="add"
        size="large"
      >
        <AddIcon />
      </IconButton>

      {requiredFields.length !== 2 && (
        <IconButton
          onClick={() => onRemoveField(field.id || '')}
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

export default FunctionFieldRow;
