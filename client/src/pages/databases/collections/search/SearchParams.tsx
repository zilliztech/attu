import { FC, useCallback, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import { INDEX_PARAMS_CONFIG } from '@/pages/databases/collections/schema/indexParamsConfig';
import IndexParamField from '@/pages/databases/collections/schema/IndexParamField';
import type { SearchParamsProps } from '../../../search/Types';

const SearchParams: FC<SearchParamsProps> = ({
  indexType = '',
  searchParamsForm,
  handleFormChange,
  topK,
  setParamsDisabled,
  sx = {},
}) => {
  // Get search params based on index type
  const searchParams = useMemo(() => {
    // Common params that are always available
    const commonParams = ['radius', 'range_filter'];

    // Get search params for the specific index type
    const indexParams: string[] = [];
    Object.values(INDEX_PARAMS_CONFIG).forEach(dataTypeConfig => {
      const config = dataTypeConfig[indexType];
      if (config?.searchParams) {
        Object.keys(config.searchParams).forEach(param => {
          indexParams.push(param);
        });
      }
    });

    return [...indexParams, ...commonParams];
  }, [indexType]);

  const handleInputChange = useCallback(
    (key: string, value: string | number | boolean) => {
      let form = { ...searchParamsForm };
      if (value === '') {
        delete form[key];
      } else {
        form = { ...searchParamsForm, [key]: value };
      }
      console.log('new form', form);
      handleFormChange(form);
    },
    [handleFormChange, searchParamsForm]
  );

  // Get search param config from INDEX_PARAMS_CONFIG
  const getSearchParamConfig = useCallback(
    (paramKey: string) => {
      // For common params
      if (paramKey === 'radius' || paramKey === 'range_filter') {
        return {
          label: paramKey === 'radius' ? 'radius' : 'range filter',
          key: paramKey,
          type: 'number' as const,
          required: false,
          description: `searchParams.${paramKey}.description`,
          helperText: `searchParams.${paramKey}.helperText`,
        };
      }

      // For index specific params
      for (const dataTypeConfig of Object.values(INDEX_PARAMS_CONFIG)) {
        const config = dataTypeConfig[indexType];
        if (config?.searchParams?.[paramKey]) {
          return config.searchParams[paramKey];
        }
      }

      return null;
    },
    [indexType]
  );

  // Create validation rules for each param
  const validationRules = useMemo(() => {
    return searchParams.reduce<
      Record<
        string,
        Array<{ rule: string; errorText: string; extraParam?: number }>
      >
    >((rules, param) => {
      const config = getSearchParamConfig(param);
      if (!config) return rules;

      const paramRules = [];
      if (config.required) {
        paramRules.push({
          rule: 'require',
          errorText: 'This field is required',
        });
      }
      if (config.type === 'number') {
        if (config.min !== undefined) {
          paramRules.push({
            rule: 'min',
            extraParam: config.min,
            errorText: `Value must be greater than or equal to ${config.min}`,
          });
        }
        if (config.max !== undefined) {
          paramRules.push({
            rule: 'max',
            extraParam: config.max,
            errorText: `Value must be less than or equal to ${config.max}`,
          });
        }
      }
      return { ...rules, [param]: paramRules };
    }, {});
  }, [searchParams, getSearchParamConfig]);

  // Convert form to validation format
  const formForValidation = useMemo(() => {
    return searchParams.map(param => ({
      key: param,
      value: searchParamsForm[param] ?? '',
      needCheck: true,
    }));
  }, [searchParams, searchParamsForm]);

  console.log(formForValidation)

  const { validation, checkIsValid, disabled } =
    useFormValidation(formForValidation);

  useEffect(() => {
    setParamsDisabled(disabled);
  }, [disabled, setParamsDisabled]);

  // Handle validation on value change
  const handleValueChange = useCallback(
    (key: string, value: string | number | boolean) => {
      handleInputChange(key, value);
      const config = getSearchParamConfig(key);
      if (!config) return;

      // Convert value to number for number type fields
      const valueToCheck =
        config.type === 'number' ? Number(value) : String(value);

      console.log('valueToCheck', valueToCheck, validationRules[key]);

      checkIsValid({
        key,
        value: valueToCheck,
        rules: validationRules[key] || [],
      });
    },
    [handleInputChange, checkIsValid, validationRules, getSearchParamConfig]
  );

  return (
    <Box
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {searchParams.map(param => {
        const config = getSearchParamConfig(param);
        if (!config) return null;

        const error = validation[param];
        const value = searchParamsForm[param] ?? '';

        console.log('error', error);

        return (
          <IndexParamField
            key={param}
            config={config}
            value={value}
            onChange={handleValueChange}
            error={error?.errText}
          />
        );
      })}
    </Box>
  );
};

export default SearchParams;
