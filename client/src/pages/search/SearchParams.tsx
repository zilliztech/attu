import { makeStyles, Theme } from '@material-ui/core';
import { FC, useCallback, useContext, useEffect, useMemo } from 'react';
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
import { SearchParamInputConfig, SearchParamsProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  selector: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  inlineInput: {
    width: 160,
    '&:nth-child(odd)': {
      marginRight: theme.spacing(1),
    },
  },
  inlineInputWrapper: {},
}));

const SearchParams: FC<SearchParamsProps> = ({
  indexType = '',
  indexParams = [],
  searchParamsForm,
  handleFormChange,
  topK,
  setParamsDisabled,
  wrapperClass = '',
}) => {
  const { t: warningTrans } = useTranslation('warning');
  const classes = getStyles();

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
        className: classes.inlineInput,
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
    [classes.inlineInput, warningTrans]
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
          className: classes.inlineInput,
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
          className: classes.inlineInput,
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
          className: classes.inlineInput,
        },
        radius: {
          label: 'radius',
          key: 'radius',
          type: 'number',
          value: searchParamsForm['radius'] ?? '',
          isInt: false,
          required: false,
          handleChange: value => {
            console.log(value, typeof value);
            handleInputChange('radius', value);
          },
          className: classes.inlineInput,
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
          className: classes.inlineInput,
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
          max: 3,
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
          handleChange: value => {
            handleInputChange('drop_ratio_search', value);
          },
        },
      };

      const param = configParamMap[paramKey];
      return getInputConfig(param);
    },
    [
      indexParams,
      searchParamsForm,
      classes.inlineInput,
      topK,
      getInputConfig,
      handleInputChange,
    ]
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
    <div className={wrapperClass}>
      <div className={classes.inlineInputWrapper}>
        {/* dynamic params, now every type only has one param except metric type */}
        {searchParams.map(param => (
          <CustomInput
            key={param}
            type="text"
            textConfig={getSearchInputConfig(param)}
            checkValid={checkIsValid}
            validInfo={validation}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchParams;
