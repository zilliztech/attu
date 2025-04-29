import { FC } from 'react';
import { IconButton, Box } from '@mui/material';
import icons from '@/components/icons/Icons';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../../databases/collections/Types';
import NameField from '../NameField';
import VectorTypeSelector from '../VectorTypeSelector';
import DimensionField from '../DimensionField';
import DescriptionField from '../DescriptionField';
import { rowStyles } from './styles';

interface VectorFieldRowProps {
  field: FieldType;
  index: number;
  requiredFields?: FieldType[];
  onFieldChange: (
    id: string,
    changes: Partial<FieldType>,
    isValid?: boolean
  ) => void;
  onAddField: (index: number, type: DataTypeEnum) => void;
  onRemoveField?: (id: string) => void;
  showDeleteButton?: boolean;
}

const VectorFieldRow: FC<VectorFieldRowProps> = ({
  field,
  index,
  requiredFields = [],
  onFieldChange,
  onAddField,
  onRemoveField,
  showDeleteButton = false,
}) => {
  const AddIcon = icons.addOutline;
  const RemoveIcon = icons.remove;

  const showDelete =
    showDeleteButton && onRemoveField && requiredFields.length !== 2;

  return (
    <Box sx={rowStyles}>
      <NameField
        field={field}
        onChange={(id, name, isValid) =>
          onFieldChange(field.id!, { name }, isValid)
        }
      />

      <VectorTypeSelector
        value={field.data_type}
        onChange={(value: DataTypeEnum) =>
          onFieldChange(field.id!, { data_type: value })
        }
      />

      <DimensionField field={field} onChange={onFieldChange} />

      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description })}
      />

      <IconButton
        onClick={() => onAddField(index, field.data_type)}
        sx={{
          padding: 0,
          position: 'relative',
          top: '-8px',
          '& svg': { width: 15 },
        }}
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
          sx={{
            padding: 0,
            position: 'relative',
            top: '-8px',
            '& svg': { width: 15 },
          }}
          aria-label="delete"
          size="large"
        >
          <RemoveIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default VectorFieldRow;
