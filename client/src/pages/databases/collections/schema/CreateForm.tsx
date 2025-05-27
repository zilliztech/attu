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

  const { t: indexTrans } = useTranslation('index');

  const getMetricDescription = (type: string) => {
    return indexTrans(`metricType.${type}.description`);
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
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '13px',
                lineHeight: '20px',
                padding: '6px 16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[900]
                      : theme.palette.grey[100],
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
        helperText={''}
        inputProps={{
          pattern: '^[a-zA-Z_].*',
          title: 'Index name must start with a letter or underscore',
        }}
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
            {getMetricDescription(formValue.metric_type)}
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
              error={''}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CreateForm;
