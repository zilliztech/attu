import { FC, useCallback, useContext, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import {
  DEFAULT_NLIST_VALUE,
  DEFAULT_SEARCH_PARAM_VALUE_MAP,
  INDEX_CONFIG,
  searchKeywordsType,
} from '@/consts';
import { rootContext } from '@/context';
import { useFormValidation } from '@/hooks';
import { formatForm } from '@/utils';
import type { SearchParamInputConfig, SearchParamsProps } from './Types';

const SearchParams: FC<SearchParamsProps> = ({
  indexType = '',
  indexParams = [],
  searchParamsForm,
  handleFormChange,
  topK,
  setParamsDisabled,
  sx = {},
}) => {
  const { t: warningTrans } = useTranslation('warning');

  const { openSnackBar } = useContext(rootContext);

  // search params key list, depends on index type
  // e.g. ['nprobe']
  const searchParams = useMemo((): searchKeywordsType[] => {
    const isSupportedType = Object.keys(INDEX_CONFIG).includes(indexType);

    // show warning snackbar for unsupported type
    if (!isSupportedType) {
      indexType !== '' &&
        openSnackBar(
          warningTrans('noSupportIndexType', { type: indexType }),
          'warning'
        );
    }

    const commonParams: searchKeywordsType[] = ['radius', 'range_filter'];
    return indexType !== '' && isSupportedType
      ? [...INDEX_CONFIG[indexType!].search, ...commonParams]
      : commonParams;
  }, [indexType, openSnackBar, warningTrans]);

  const handleInputChange = useCallback(
    (key: string, value: number | string | typeof NaN) => {
      let form = { ...searchParamsForm };
      if (value === '' || isNaN(value as any)) {
        delete form[key];
      } else {
        form = { ...searchParamsForm, [key]: value };
      }

      handleFormChange(form);
    },
    [handleFormChange, searchParamsForm]
  );

  /**
   * function to transfer search params to CustomInput need config type
   */
  const getInputConfig = useCallback(
    (params: SearchParamInputConfig): ITextfieldConfig => {
      const {
        label,
        key,
        min,
        max,
        value,
        handleChange,
        isInt = true,
        type = 'number',
        required = true,
      } = params;

      // search_k range is special compared to others，need to be handled separately
      // range: {-1} ∪ [top_k, n × n_trees]
      const isSearchK = label === 'search_k';

      const config: ITextfieldConfig = {
        label,
        key,
        onChange: value => {
          handleChange(value);
        },
        className: 'inline-input',
        variant: 'filled',
        type: type,
        value,
        validations: [],
      };

      if (required) {
        config.validations?.push({
          rule: 'require',
          errorText: warningTrans('required', { name: label }),
        });
      }

      if (isInt) {
        config.validations?.push({
          rule: 'integer',
          errorText: warningTrans('integer', { name: label }),
        });
      }

      if (typeof min === 'number' && typeof max === 'number') {
        config.validations?.push({
          rule: 'range',
          errorText: warningTrans('range', { name: label, min, max }),
          extraParam: { min, max, type: 'number' },
        });
      }

      // search_k
      if (isSearchK) {
        config.validations?.push({
          rule: 'specValueOrRange',
          errorText: warningTrans('specValueOrRange', {
            name: label,
            min,
            max,
            specValue: -1,
          }),
          extraParam: {
            min,
            max,
            compareValue: -1,
            type: 'number',
          },
        });
      }
      return config;
    },
    [warningTrans]
  );

  const getSearchInputConfig = useCallback(
    (paramKey: searchKeywordsType): ITextfieldConfig => {
      const nlist = Number(
        // nlist range is [1, 65536], if user didn't create index, we set 1024 as default nlist value
        indexParams.find(p => p.key === 'nlist')?.value || DEFAULT_NLIST_VALUE
      );

      const configParamMap: {
        [key in searchKeywordsType]: SearchParamInputConfig;
      } = {
        filter: {
          label: 'filter',
          key: 'filter',
          value: searchParamsForm['filter'] ?? '',
          isInt: false,
          type: 'text',
          required: false,
          handleChange: value => {
            handleInputChange('filter', value);
          },
          className: 'inline-input',
        },
        round_decimal: {
          label: 'round',
          key: 'round_decimal',
          type: 'number',
          value: searchParamsForm['round_decimal'] ?? '',
          min: -1,
          max: 10,
          isInt: true,
          required: false,
          handleChange: value => {
            handleInputChange('round_decimal', value);
          },
          className: 'inline-input',
        },
        nprobe: {
          label: 'nprobe',
          key: 'nprobe',
          type: 'number',
          value: searchParamsForm['nprobe'] ?? '',
          min: 1,
          max: nlist,
          isInt: true,
          handleChange: value => {
            handleInputChange('nprobe', value);
          },
          className: 'inline-input',
        },
        radius: {
          label: 'radius',
          key: 'radius',
          type: 'number',
          value: searchParamsForm['radius'] ?? '',
          isInt: false,
          required: false,
          handleChange: value => {
            handleInputChange('radius', value);
          },
          className: 'inline-input',
        },
        range_filter: {
          label: 'range filter',
          key: 'range_filter',
          value: searchParamsForm['range_filter'] ?? '',
          isInt: false,
          required: false,
          type: 'number',
          handleChange: value => {
            handleInputChange('range_filter', value);
          },
          className: 'inline-input',
        },
        ef: {
          label: 'ef',
          key: 'ef',
          value: searchParamsForm['ef'] ?? '',
          isInt: true,
          type: 'number',
          handleChange: value => {
            handleInputChange('ef', value);
          },
        },
        level: {
          label: 'level',
          key: 'level',
          value: searchParamsForm['level'] ?? 1,
          min: 1,
          max: 5,
          isInt: true,
          required: false,
          type: 'number',
          handleChange: value => {
            handleInputChange('level', value);
          },
        },
        search_k: {
          label: 'search_k',
          key: 'search_k',
          value: searchParamsForm['search_k'] ?? topK,
          min: topK,
          // n * n_trees can be infinity
          max: Infinity,
          isInt: true,
          type: 'number',
          handleChange: value => {
            handleInputChange('search_k', value);
          },
        },
        search_length: {
          label: 'search_length',
          key: 'search_length',
          value: searchParamsForm['search_length'] ?? '',
          min: 10,
          max: 300,
          isInt: true,
          type: 'number',
          handleChange: value => {
            handleInputChange('search_length', value);
          },
        },
        search_list: {
          label: 'search_list',
          key: 'search_list',
          value: searchParamsForm['search_list'] ?? '',
          min: 150,
          max: 65535,
          isInt: true,
          type: 'number',
          handleChange: value => {
            handleInputChange('search_list', value);
          },
        },
        drop_ratio_search: {
          label: 'drop_ratio_search',
          key: 'drop_ratio_search',
          value: searchParamsForm['drop_ratio_search'] ?? '',
          min: 0,
          max: 1,
          isInt: false,
          type: 'number',
          required: false,
          handleChange: value => {
            handleInputChange('drop_ratio_search', value);
          },
        },
        itopk_size: {
          label: 'itopk_size',
          key: 'itopk_size',
          value: searchParamsForm['itopk_size'] ?? '',
          isInt: true,
          type: 'number',
          required: false,
          handleChange: value => {
            handleInputChange('itopk_size', value);
          },
        },
        search_width: {
          label: 'search_width',
          key: 'search_width',
          value: searchParamsForm['search_width'] ?? '',
          isInt: true,
          type: 'number',
          required: false,
          handleChange: value => {
            handleInputChange('search_width', value);
          },
        },
        min_iterations: {
          label: 'min_iterations',
          key: 'min_iterations',
          value: searchParamsForm['min_iterations'] ?? '0',
          isInt: true,
          type: 'number',
          required: false,
          handleChange: value => {
            handleInputChange('min_iterations', value);
          },
        },
        max_iterations: {
          label: 'max_iterations',
          key: 'max_iterations',
          value: searchParamsForm['max_iterations'] ?? '0',
          isInt: true,
          type: 'number',
          required: false,
          handleChange: value => {
            handleInputChange('max_iterations', value);
          },
        },
        team_size: {
          label: 'team_size',
          key: 'team_size',
          value: searchParamsForm['team_size'] ?? '0',
          min: 2,
          max: 32,
          isInt: true,
          type: 'number',
          required: false,
          handleChange: value => {
            handleInputChange('team_size', value);
          },
        },
      };

      const param = configParamMap[paramKey];
      return getInputConfig(param);
    },
    [indexParams, searchParamsForm, topK, getInputConfig, handleInputChange]
  );

  useEffect(() => {
    // generate different form according to search params
    const form = searchParams.reduce(
      (paramsForm, param) => ({
        ...paramsForm,
        [param]: DEFAULT_SEARCH_PARAM_VALUE_MAP[param],
      }),
      {}
    );
    handleFormChange(form);
  }, []);

  const checkedForm = useMemo(() => {
    const { ...needCheckItems } = searchParamsForm;
    return formatForm(needCheckItems);
  }, [searchParamsForm]);

  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  useEffect(() => {
    setParamsDisabled(disabled);
  }, [disabled, setParamsDisabled]);

  return (
    <Box
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        '& .inline-input': {
          marginBottom: '20px',
        },
      }}
    >
      {/* dynamic params, now every type only has one param except metric type */}
      {searchParams.map(param => (
        <CustomInput
          key={param}
          type="text"
          textConfig={{
            ...getSearchInputConfig(param),
            className: 'inline-input',
            sx: {
              width: '100%',
              '& .MuiFormHelperText-root': {
                position: 'absolute',
                margin: 0,
                padding: '0 14px',
                fontSize: '0.75rem',
                lineHeight: '1.66',
                letterSpacing: '0.03333em',
                textAlign: 'left',
                marginTop: '3px',
                marginRight: '14px',
                marginBottom: '0',
                marginLeft: '14px',
              },
            },
            variant: 'outlined',
            InputLabelProps: { shrink: true },
          }}
          checkValid={checkIsValid}
          validInfo={validation}
        />
      ))}
    </Box>
  );
};

export default SearchParams;
