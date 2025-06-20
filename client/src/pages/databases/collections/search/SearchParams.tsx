import { FC, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import { INDEX_PARAMS_CONFIG } from '@/pages/databases/collections/schema/indexParamsConfig';
import IndexParamField from '@/pages/databases/collections/schema/IndexParamField';
import type { SearchParamsProps } from './Types';
import type { IndexParamConfig } from '@/pages/databases/collections/schema/indexParamsConfig';

const COMMON_PARAMS = ['level', 'radius', 'range_filter'] as const;

const SearchParams: FC<SearchParamsProps> = ({
  indexType = '',
  searchParamsForm,
  handleFormChange,
  isManaged,
  sx = {},
}) => {
  // Get search params and their configs based on index type
  const { paramList, paramConfigs } = useMemo(() => {
    // Common params that are always available
    const commonParams: Record<string, IndexParamConfig> = {
      radius: {
        label: 'radius',
        key: 'radius',
        type: 'number',
        required: false,
        // description: 'searchParams.radius.description',
        // helperText: 'searchParams.radius.helperText',
      },
      range_filter: {
        label: 'range filter',
        key: 'range_filter',
        type: 'number',
        required: false,
        // helperText: 'searchParams.range_filter.helperText',
        // description: 'searchParams.range_filter.description',
      },
    };

    if (indexType === 'AUTOINDEX' && isManaged) {
      commonParams.level = {
        label: 'level',
        key: 'level',
        type: 'number',
        required: false,
        min: 1,
        max: 10,
        defaultValue: '1',
        helperText: 'searchParams.level.description',
      };
    }

    // Get search params for the specific index type
    const indexParams: Record<string, IndexParamConfig> = {};
    Object.values(INDEX_PARAMS_CONFIG).forEach(dataTypeConfig => {
      const config = dataTypeConfig[indexType];
      if (config?.searchParams) {
        Object.entries(config.searchParams).forEach(([param, paramConfig]) => {
          indexParams[param] = paramConfig;
        });
      }
    });

    const allParams = { ...indexParams, ...commonParams };
    const allParamKeys = Object.keys(allParams);

    // Sort params to ensure common params are at the end
    const sortedParamKeys = allParamKeys.sort((a, b) => {
      const aIsCommon = COMMON_PARAMS.includes(
        a as (typeof COMMON_PARAMS)[number]
      );
      const bIsCommon = COMMON_PARAMS.includes(
        b as (typeof COMMON_PARAMS)[number]
      );
      if (aIsCommon && !bIsCommon) return 1;
      if (!aIsCommon && bIsCommon) return -1;
      if (aIsCommon && bIsCommon) {
        return (
          COMMON_PARAMS.indexOf(a as (typeof COMMON_PARAMS)[number]) -
          COMMON_PARAMS.indexOf(b as (typeof COMMON_PARAMS)[number])
        );
      }
      return 0;
    });

    return {
      paramList: sortedParamKeys,
      paramConfigs: allParams,
    };
  }, [indexType]);

  const handleInputChange = useCallback(
    (key: string, value: string | number | boolean) => {
      let form = { ...searchParamsForm };
      if (value === '') {
        delete form[key];
      } else {
        form = { ...searchParamsForm, [key]: value };
      }
      handleFormChange(form);
    },
    [handleFormChange, searchParamsForm]
  );

  return (
    <Box
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {paramList.map(param => {
        const config = paramConfigs[param];
        if (!config) return null;

        const value = searchParamsForm[param] ?? config.defaultValue ?? '';

        return (
          <IndexParamField
            key={param}
            config={config}
            value={value}
            onChange={handleInputChange}
            error={''}
          />
        );
      })}
    </Box>
  );
};

export default SearchParams;
