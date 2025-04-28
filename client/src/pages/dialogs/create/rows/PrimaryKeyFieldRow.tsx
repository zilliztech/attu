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
  autoID: boolean;
  onFieldChange: (id: string, changes: Partial<FieldType>) => void;
  setAutoID: (value: boolean) => void;
}

const PrimaryKeyFieldRow: FC<PrimaryKeyFieldRowProps> = ({
  field,
  autoID,
  onFieldChange,
  setAutoID,
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
        onChange={(id, name) => onFieldChange(field.id!, { name: name })}
        label={collectionTrans('idFieldName')}
      />

      <PrimaryKeyTypeSelector
        value={field.data_type}
        onChange={(value: DataTypeEnum) => {
          onFieldChange(field.id!, { data_type: value });
          if (value === DataTypeEnum.VarChar) {
            setAutoID(false);
          }
        }}
        sx={{ width: '150px' }}
      />

      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description })}
        sx={{ width: '64px' }}
      />

      {isVarChar && (
        <MaxLengthField
          field={field}
          onChange={onFieldChange}
          sx={{ maxWidth: '80px' }}
        />
      )}

      <FormControlLabel
        control={
          <Switch
            checked={autoID}
            disabled={isVarChar}
            size="small"
            onChange={() => {
              onFieldChange(field.id!, { autoID: !autoID });
              setAutoID(!autoID);
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
