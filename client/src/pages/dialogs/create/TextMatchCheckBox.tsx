import React from 'react';
import { Checkbox } from '@mui/material';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import type { FieldType } from '../../databases/collections/Types';
import { useStyles } from './styles';

interface TextMatchCheckBoxProps {
  field: FieldType;
  onChange: (id: string, update: Partial<FieldType>) => void;
  collectionTrans: (key: string) => string;
}

const TextMatchCheckBox: React.FC<TextMatchCheckBoxProps> = ({
  field,
  onChange,
  collectionTrans,
}) => {
  const classes = useStyles();

  const handleChange = () => {
    const update: Partial<FieldType> = {
      enable_match: !field.enable_match,
    };

    if (!field.enable_match) {
      update.enable_analyzer = true;
    }

    onChange(field.id!, update);
  };

  return (
    <div className={classes.setting}>
      <label htmlFor="enableMatch">
        <Checkbox
          id="enableMatch"
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

export default TextMatchCheckBox;
