import { FC, MutableRefObject } from 'react';
import { IconButton, Theme, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import icons from '@/components/icons/Icons';
import { DataTypeEnum } from '@/consts';
import { DEFAULT_ATTU_ELEMENT_TYPE, DEFAULT_ATTU_MAX_CAPACITY } from '@/consts';
import { FieldType } from '../../../databases/collections/Types';
import NameField from '../NameField';
import ScalarTypeSelector from '../ScalarTypeSelector';
import ElementTypeSelector from '../ElementTypeSelector';
import MaxCapacityField from '../MaxCapacityField';
import MaxLengthField from '../MaxLengthField';
import DefaultValueField from '../DefaultValueField';
import DescriptionField from '../DescriptionField';
import PartitionKeyCheckboxField from '../PartitionKeyCheckboxField';
import AnalyzerCheckboxField from '../AnalyzerCheckboxField';
import TextMatchCheckboxField from '../TextMatchCheckboxField';
import NullableCheckboxField from '../NullableCheckboxField';
import { rowStyles } from './styles';

interface ScalarFieldRowProps {
  field: FieldType;
  index: number;
  fields: FieldType[];
  onFieldChange: (
    id: string,
    changes: Partial<FieldType>,
    isValid?: boolean
  ) => void;
  onAddField: (index: number, type: DataTypeEnum) => void;
  onRemoveField: (id: string) => void;
  localFieldAnalyzers: MutableRefObject<Map<string, Record<string, {}>>>;
}

const ScalarFieldRow: FC<ScalarFieldRowProps> = ({
  field,
  index,
  fields,
  onFieldChange,
  onAddField,
  onRemoveField,
  localFieldAnalyzers,
}) => {
  const { t: collectionTrans } = useTranslation('collection');

  const AddIcon = icons.addOutline;
  const RemoveIcon = icons.remove;

  const isVarChar = field.data_type === DataTypeEnum.VarChar;
  const isInt64 = field.data_type === DataTypeEnum.Int64;
  const isArray = field.data_type === DataTypeEnum.Array;
  const isElementVarChar = field.element_type === DataTypeEnum.VarChar;
  const showDefaultValue =
    field.data_type !== DataTypeEnum.Array &&
    field.data_type !== DataTypeEnum.JSON;

  // handle default values for Array type
  if (isArray && typeof field.element_type === 'undefined') {
    onFieldChange(field.id!, { element_type: DEFAULT_ATTU_ELEMENT_TYPE });
  }
  if (isArray && typeof field.max_capacity === 'undefined') {
    onFieldChange(field.id!, { max_capacity: DEFAULT_ATTU_MAX_CAPACITY });
  }

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
    paddingRight: 2,
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
        onChange={(id, name, isValid) => onFieldChange(id, { name }, isValid)}
      />

      <ScalarTypeSelector
        value={field.data_type}
        onChange={(value: DataTypeEnum) =>
          onFieldChange(field.id!, { data_type: value }, true)
        }
        sx={{ width: '105px' }}
      />

      {isArray && (
        <ElementTypeSelector
          value={field.element_type || DEFAULT_ATTU_ELEMENT_TYPE}
          onChange={(value: DataTypeEnum) =>
            onFieldChange(field.id!, { element_type: value }, true)
          }
          sx={{ width: '105px' }}
        />
      )}

      {isArray && (
        <MaxCapacityField
          field={field}
          onChange={(id, max_capacity, isValid) => {
            onFieldChange(id, { max_capacity }, isValid);
          }}
          sx={{ maxWidth: '80px' }}
        />
      )}

      {(isVarChar || isElementVarChar) && (
        <MaxLengthField
          field={field}
          onChange={(id, max_length, isValid) =>
            onFieldChange(id, { max_length }, isValid)
          }
          sx={{ maxWidth: '80px' }}
        />
      )}

      {showDefaultValue && (
        <DefaultValueField
          field={field}
          onChange={(id, defaultValue) =>
            onFieldChange(id, { default_value: defaultValue }, true)
          }
          sx={{ width: '64px' }}
          label={collectionTrans('defaultValue')}
        />
      )}

      <DescriptionField
        field={field}
        onChange={(id, description) => onFieldChange(id, { description }, true)}
        sx={{ width: '64px' }}
      />

      <Box sx={paramsGrpStyles}>
        {isInt64 && (
          <PartitionKeyCheckboxField
            field={field}
            fields={fields}
            onChange={onFieldChange}
            sx={settingStyles}
          />
        )}

        {isVarChar && (
          <>
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
          </>
        )}

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

      <IconButton
        onClick={() => onRemoveField(field.id || '')}
        sx={iconBtnStyles}
        aria-label="delete"
        size="large"
      >
        <RemoveIcon />
      </IconButton>
    </Box>
  );
};

export default ScalarFieldRow;
