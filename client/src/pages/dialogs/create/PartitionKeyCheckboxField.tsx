import { FC } from 'react';
import { Checkbox, SxProps, Theme, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { FieldType } from '../../databases/collections/Types';

interface PartitionKeyCheckboxFieldProps {
  field: FieldType;
  fields: FieldType[];
  onChange: (id: string, changes: Partial<FieldType>) => void;
  sx?: SxProps<Theme>;
}

const PartitionKeyCheckboxField: FC<PartitionKeyCheckboxFieldProps> = ({
  field,
  fields,
  onChange,
  sx,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  const disabled =
    (fields.some(f => f.is_partition_key) && !field.is_partition_key) ||
    field.nullable;

  const handleChange = () => {
    onChange(field.id!, {
      is_partition_key: !field.is_partition_key,
    });
  };

  return (
    <Box sx={sx}>
      <label htmlFor={`partitionKey-${field.id}`}>
        <Checkbox
          id={`partitionKey-${field.id}`}
          checked={!!field.is_partition_key}
          size="small"
          disabled={disabled}
          onChange={handleChange}
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
    </Box>
  );
};

export default PartitionKeyCheckboxField;
