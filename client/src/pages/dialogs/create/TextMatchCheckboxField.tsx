import { FC } from 'react';
import { Checkbox } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { FieldType } from '../../databases/collections/Types';

interface TextMatchCheckboxFieldProps {
  field: FieldType;
  onChange: (id: string, changes: Partial<FieldType>) => void;
  className?: string;
}

const TextMatchCheckboxField: FC<TextMatchCheckboxFieldProps> = ({
  field,
  onChange,
  className = '',
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  const handleChange = () => {
    const update: Partial<FieldType> = {
      enable_match: !field.enable_match,
    };

    // If enabling text match, also enable analyzer
    if (!field.enable_match) {
      update.enable_analyzer = true;
    }

    onChange(field.id!, update);
  };

  return (
    <div className={className}>
      <label htmlFor={`enableMatch-${field.id}`}>
        <Checkbox
          id={`enableMatch-${field.id}`}
          checked={!!field.enable_match}
          size="small"
          onChange={handleChange}
        />
        <CustomToolTip
          title={collectionTrans('textMatchTooltip')}
          placement="top"
        >
          <>{collectionTrans('enableMatch')}</>
        </CustomToolTip>
      </label>
    </div>
  );
};

export default TextMatchCheckboxField;
