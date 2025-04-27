import { FC } from 'react';
import { IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import icons from '@/components/icons/Icons';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../databases/collections/Types';
import NameField from './NameField';
import VectorTypeSelector from './VectorTypeSelector';
import DimensionField from './DimensionField';
import DescriptionField from './DescriptionField';

interface VectorFieldRowProps {
  field: FieldType;
  index: number;
  requiredFields?: FieldType[];
  onFieldChange: (id: string, changes: Partial<FieldType>) => void;
  onAddField: (index: number, type: DataTypeEnum) => void;
  onRemoveField?: (id: string) => void;
  showDeleteButton?: boolean;
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
  numberBox: {
    width: '80px',
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
}));

const VectorFieldRow: FC<VectorFieldRowProps> = ({
  field,
  index,
  requiredFields = [],
  onFieldChange,
  onAddField,
  onRemoveField,
  showDeleteButton = false,
  className,
}) => {
  const classes = useStyles();

  const AddIcon = icons.addOutline;
  const RemoveIcon = icons.remove;

  // 判断是否应该显示删除按钮
  const showDelete =
    showDeleteButton && onRemoveField && requiredFields.length !== 2;

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

      <DimensionField
        field={field}
        onChange={onFieldChange}
        inputClassName={classes.numberBox}
      />

      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description })}
        className={classes.descInput}
      />

      <IconButton
        onClick={() => onAddField(index, field.data_type)}
        classes={{ root: classes.iconBtn }}
        aria-label="add"
        size="large"
      >
        <AddIcon />
      </IconButton>

      {showDelete && (
        <IconButton
          onClick={() => {
            const id = field.id || '';
            onRemoveField(id);
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

export default VectorFieldRow;
