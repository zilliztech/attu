import { FC, MutableRefObject, useMemo } from 'react';
import { IconButton, Theme, Box, SxProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import icons from '@/components/icons/Icons';
import { DataTypeEnum } from '@/consts';
import { FieldType } from '../../../databases/collections/Types';
import NameField from '../NameField';
import VectorTypeSelector from '../VectorTypeSelector';
import MaxLengthField from '../MaxLengthField';
import DefaultValueField from '../DefaultValueField';
import DescriptionField from '../DescriptionField';
import AnalyzerCheckboxField from '../AnalyzerCheckboxField';
import TextMatchCheckboxField from '../TextMatchCheckboxField';
import PartitionKeyCheckboxField from '../PartitionKeyCheckboxField';
import NullableCheckboxField from '../NullableCheckboxField';

interface FunctionFieldRowProps {
  field: FieldType;
  index: number;
  fields: FieldType[];
  requiredFields: FieldType[];
  onFieldChange: (id: string, changes: Partial<FieldType>) => void;
  onAddField: (index: number, type: DataTypeEnum) => void;
  onRemoveField: (id: string) => void;
  localFieldAnalyzers: MutableRefObject<Map<string, Record<string, {}>>>;
  sx?: SxProps<Theme>;
}

const FunctionFieldRow: FC<FunctionFieldRowProps> = ({
  field,
  index,
  fields,
  requiredFields,
  onFieldChange,
  onAddField,
  onRemoveField,
  localFieldAnalyzers,
  sx,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  const AddIcon = icons.addOutline;
  const RemoveIcon = icons.remove;

  const rowStyles = useMemo(
    () => ({
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
    }),
    [sx]
  ) as SxProps<Theme>;

  const selectStyles = {
    width: '150px',
    marginTop: '-20px',
  };

  const maxLengthStyles = {
    maxWidth: '80px',
  };

  const descInputStyles = {
    width: '64px',
  };

  const iconBtnStyles = {
    padding: 0,
    position: 'relative',
    top: '-8px',
    '& svg': {
      width: 15,
    },
  };

  const paramsGrpStyles = (theme: Theme) => ({
    border: `1px dashed ${theme.palette.divider}`,
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 8,
    minHeight: 44,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    justifyContent: 'center',
  });

  const settingStyles = {
    fontSize: 12,
    alignItems: 'center',
    display: 'flex',
  };

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
        sx={selectStyles}
      />

      <MaxLengthField
        field={field}
        onChange={onFieldChange}
        sx={maxLengthStyles}
      />

      <DefaultValueField
        field={field}
        onChange={(id, defaultValue) =>
          onFieldChange(id, { default_value: defaultValue })
        }
        sx={descInputStyles}
        label={collectionTrans('defaultValue')}
      />

      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description })}
        sx={descInputStyles}
      />

      <Box sx={paramsGrpStyles}>
        <AnalyzerCheckboxField
          field={field}
          onChange={onFieldChange}
          localFieldAnalyzers={localFieldAnalyzers}
          sx={settingStyles}
        />

        <TextMatchCheckboxField
          field={field}
          onChange={onFieldChange}
          sx={settingStyles}
        />

        <PartitionKeyCheckboxField
          field={field}
          fields={fields}
          onChange={onFieldChange}
          sx={settingStyles}
        />

        <NullableCheckboxField
          field={field}
          onChange={onFieldChange}
          sx={settingStyles}
        />
      </Box>

      <IconButton
        onClick={() => onAddField(index, field.data_type)}
        sx={iconBtnStyles}
        aria-label="add"
        size="large"
      >
        <AddIcon />
      </IconButton>

      {requiredFields.length !== 2 && (
        <IconButton
          onClick={() => onRemoveField(field.id || '')}
          sx={iconBtnStyles}
          aria-label="delete"
          size="large"
        >
          <RemoveIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default FunctionFieldRow;
