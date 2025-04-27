import { FC } from 'react';
import { Checkbox, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { FieldType } from '../../databases/collections/Types';
import { SxProps, Theme } from '@mui/material';

interface NullableCheckboxFieldProps {
  field: FieldType;
  onChange: (id: string, changes: Partial<FieldType>) => void;
  sx?: SxProps<Theme>;
}

const NullableCheckboxField: FC<NullableCheckboxFieldProps> = ({
  field,
  onChange,
  sx,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  return (
    <Box sx={sx}>
      <label htmlFor={`nullable-${field.id}`}>
        <Checkbox
          id={`nullable-${field.id}`}
          checked={!!field.nullable}
          size="small"
          onChange={() => {
            onChange(field.id!, {
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
    </Box>
  );
};

export default NullableCheckboxField;
