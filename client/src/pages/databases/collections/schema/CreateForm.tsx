import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListSubheader,
  Box,
  TextField,
  FormHelperText,
} from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import type { Option, GroupOption } from '@/components/customSelector/Types';
import type { FormHelperType } from '../../../../types/Common';
import { INDEX_PARAMS_CONFIG } from './indexParamsConfig';
import IndexParamField from './IndexParamField';
import { DataTypeEnum } from '@/consts';

const CreateForm = (
  props: FormHelperType & {
    metricOptions: Option[];
    indexOptions: GroupOption[];
    indexParams: string[];
    indexTypeChange?: (type: string) => void;
    fieldType: DataTypeEnum;
  }
) => {
  const theme = useTheme();
  const {
    updateForm,
    formValue,
    validation,
    indexTypeChange,
    indexOptions,
    metricOptions,
    wrapperClass,
    fieldType,
  } = props;

  const { t: commonTrans } = useTranslation();
  const { t: indexTrans } = useTranslation('index');

  const metricTypeDescriptions = {
    IP: 'Inner Product: Measures similarity based on the dot product of vectors. Higher values indicate greater similarity.',
    L2: 'Euclidean Distance: Measures similarity based on the straight-line distance between vectors. Lower values indicate greater similarity.',
    COSINE:
      'Cosine Similarity: Measures similarity based on the cosine of the angle between vectors. Values range from -1 to 1, with 1 indicating identical vectors.',
    BM25: 'BM25: A ranking function used for text search, based on the probabilistic relevance framework.',
  };

  const paramConfigs = useMemo(() => {
    const config = INDEX_PARAMS_CONFIG[fieldType]?.[formValue.index_type];
    if (!config) return [];

    const { required, optional, params } = config;
    return [
      ...required.map(key => ({ ...params[key], required: true })),
      ...optional.filter(key => key && params[key]).map(key => params[key]),
    ];
  }, [fieldType, formValue.index_type]);

  // Helper function to get error message
  const getErrorMessage = (key: string) => {
    const error = validation?.[key];
    if (!error) return '';
    return typeof error === 'string' ? error : error.errText || '';
  };

  return (
    <Box
      className={wrapperClass || ''}
      sx={{
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <FormControl variant="filled" fullWidth>
        <InputLabel>{indexTrans('type')}</InputLabel>
        <Select
          value={formValue.index_type}
          onChange={e => {
            const type = e.target.value;
            updateForm('index_type', type as string);
            if (metricOptions[0]) {
              updateForm('metric_type', metricOptions[0].value as string);
            }
            indexTypeChange && indexTypeChange(type as string);
          }}
          label={indexTrans('type')}
        >
          {indexOptions.map((group, groupIndex) => [
            <ListSubheader
              key={`${group.label}-header-${groupIndex}`}
              sx={{
                backgroundColor: theme.palette.grey[100],
                color: theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '13px',
                lineHeight: '20px',
                padding: '6px 16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '&:hover': {
                  backgroundColor: theme.palette.grey[100],
                },
              }}
            >
              {group.label}
            </ListSubheader>,
            ...(group.children || []).map((option: Option) => (
              <MenuItem
                key={`${group.label}-${option.value}-${groupIndex}`}
                value={option.value}
                sx={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                {option.label}
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        variant="filled"
        label={indexTrans('indexName')}
        value={formValue.index_name}
        onChange={e => updateForm('index_name', e.target.value)}
        error={!!validation?.index_name}
        helperText={getErrorMessage('index_name')}
        InputLabelProps={{
          shrink: true,
        }}
      />

      {metricOptions.length > 0 && (
        <FormControl variant="filled" fullWidth>
          <InputLabel>{indexTrans('metric')}</InputLabel>
          <Select
            value={formValue.metric_type}
            onChange={e => {
              updateForm('metric_type', e.target.value as string);
            }}
            label={indexTrans('metric')}
          >
            {metricOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {metricTypeDescriptions[
              formValue.metric_type as keyof typeof metricTypeDescriptions
            ] || ''}
          </FormHelperText>
        </FormControl>
      )}

      {paramConfigs.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {paramConfigs.map(config => (
            <IndexParamField
              key={config.key}
              config={config}
              value={formValue[config.key] || config.defaultValue || ''}
              onChange={updateForm}
              error={getErrorMessage(config.key)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CreateForm;
