import { FC } from 'react';
import { Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { FieldType } from '../../databases/collections/Types';

interface NullableCheckboxFieldProps {
  field: FieldType;
  onChange: (id: string, changes: Partial<FieldType>) => void;
  className?: string;
}

const NullableCheckboxField: FC<NullableCheckboxFieldProps> = ({
  field,
  onChange,
  className = '',
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  return (
    <div className={className}>
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
    </div>
  );
};

export default NullableCheckboxField;
