import { FC, useMemo } from 'react';
import { IconButton, Box, SxProps, Theme } from '@mui/material';
import icons from '@/components/icons/Icons';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../../databases/collections/Types';
import NameField from '../NameField';
import VectorTypeSelector from '../VectorTypeSelector';
import DimensionField from '../DimensionField';
import DescriptionField from '../DescriptionField';

interface VectorFieldRowProps {
  field: FieldType;
  index: number;
  requiredFields?: FieldType[];
  onFieldChange: (id: string, changes: Partial<FieldType>) => void;
  onAddField: (index: number, type: DataTypeEnum) => void;
  onRemoveField?: (id: string) => void;
  showDeleteButton?: boolean;
  sx?: SxProps<Theme>;
}

const VectorFieldRow: FC<VectorFieldRowProps> = ({
  field,
  index,
  requiredFields = [],
  onFieldChange,
  onAddField,
  onRemoveField,
  showDeleteButton = false,
  sx,
}) => {
  const AddIcon = icons.addOutline;
  const RemoveIcon = icons.remove;

  const showDelete =
    showDeleteButton && onRemoveField && requiredFields.length !== 2;

  const rowStyles = useMemo(
    () =>
      ({
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
        ...(sx || {}),
      }) as SxProps<Theme>,
    [sx]
  );

  return (
    <Box sx={rowStyles}>
      <NameField
        field={field}
        onChange={(id, name) => onFieldChange(field.id!, { name: name })}
      />

      <VectorTypeSelector
        value={field.data_type}
        onChange={(value: DataTypeEnum) =>
          onFieldChange(field.id!, { data_type: value })
        }
        sx={{ width: '150px' }}
      />

      <DimensionField
        field={field}
        onChange={onFieldChange}
        sx={{ width: '80px' }}
      />

      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description })}
        sx={{ width: '64px' }}
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
