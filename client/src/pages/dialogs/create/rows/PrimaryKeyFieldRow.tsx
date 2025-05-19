import { FC } from 'react';
import { FormControlLabel, Switch, Theme, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../../databases/collections/Types';
import NameField from '../NameField';
import DescriptionField from '../DescriptionField';
import MaxLengthField from '../MaxLengthField';
import PrimaryKeyTypeSelector from '../PrimaryKeyTypeSelector';
import { rowStyles } from './styles';

interface PrimaryKeyFieldRowProps {
  field: FieldType;
  fields: FieldType[];
  onFieldChange: (
    id: string,
    changes: Partial<FieldType>,
    isValid?: boolean
  ) => void;
}

const PrimaryKeyFieldRow: FC<PrimaryKeyFieldRowProps> = ({
  field,
  fields,
  onFieldChange,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  const isVarChar = field.data_type === DataTypeEnum.VarChar;

  const toggleStyles = (theme: Theme) => ({
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  });

  return (
    <Box sx={rowStyles}>
      <NameField
        field={field}
        fields={fields}
        onChange={(id, name, isValid) => onFieldChange(id, { name }, isValid)}
        label={collectionTrans('idFieldName')}
      />

      <PrimaryKeyTypeSelector
        value={field.data_type}
        onChange={(value: DataTypeEnum) => {
          const changes: Partial<FieldType> = { data_type: value };
          if (value === DataTypeEnum.VarChar) {
            changes.autoID = false;
          }
          onFieldChange(field.id!, changes);
        }}
      />

      {isVarChar && (
        <MaxLengthField
          field={field}
          onChange={(id, max_length, isValid) =>
            onFieldChange(id, { max_length }, isValid)
          }
        />
      )}

      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description }, true)}
        sx={{ width: '64px' }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={!!field.autoID}
            size="small"
            disabled={isVarChar}
            onChange={() => {
              onFieldChange(field.id!, { autoID: !field.autoID });
            }}
          />
        }
        label={
          <CustomToolTip
            title={collectionTrans('autoIdToggleTip')}
            placement="top"
          >
            <>{collectionTrans('autoId')}</>
          </CustomToolTip>
        }
        sx={toggleStyles}
      />
    </Box>
  );
};

export default PrimaryKeyFieldRow;
