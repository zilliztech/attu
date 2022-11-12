import { makeStyles, Theme } from '@material-ui/core';
import { FC, useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomInput from '../../components/customInput/CustomInput';
import { ITextfieldConfig } from '../../components/customInput/Types';
import CustomSelector from '../../components/customSelector/CustomSelector';
import { Option } from '../../components/customSelector/Types';
import {
  DEFAULT_NLIST_VALUE,
  DEFAULT_SEARCH_PARAM_VALUE_MAP,
  INDEX_CONFIG,
  METRIC_OPTIONS_MAP,
  searchKeywordsType,
} from '../../consts/Milvus';
import { rootContext } from '../../context/Root';
import { useFormValidation } from '../../hooks/Form';
import { formatForm } from '../../utils/Form';
import { SearchParamInputConfig, SearchParamsProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  selector: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  input: {
    marginTop: theme.spacing(2),
  },
  inlineInput: {
    marginTop: theme.spacing(2),
    width: '48%',
  },
  inlineInputWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const SearchParams: FC<SearchParamsProps> = ({
  indexType,
  indexParams,
  searchParamsForm,
  handleFormChange,
  handleMetricTypeChange,
  embeddingType,
  metricType,
  topK,
  setParamsDisabled,
  wrapperClass = '',
}) => {
  const { t: indexTrans } = useTranslation('index');
  const { t: warningTrans } = useTranslation('warning');
  const classes = getStyles();

  const { openSnackBar } = useContext(rootContext);
  const metricOptions: Option[] = METRIC_OPTIONS_MAP[embeddingType];

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
    return indexType !== '' && isSupportedType
      ? [...INDEX_CONFIG[indexType].search, 'round_decimal']
      : ['round_decimal'];
  }, [indexType, openSnackBar, warningTrans]);

  const handleInputChange = useCallback(
    (key: string, value: number) => {
      const form = { ...searchParamsForm, [key]: value };
      handleFormChange(form);
    },
    [handleFormChange, searchParamsForm]
  );

  /**
   * function to transfer search params to CustomInput need config type
   */
  const getNumberInputConfig = useCallback(
    (params: SearchParamInputConfig): ITextfieldConfig => {
      const {
        label,
        key,
        min,
        max,
        value,
        handleChange,
        isInt = true,
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
        type: 'number',
        value,
        validations: [
          {
            rule: 'require',
            errorText: warningTrans('required', { name: label }),
          },
        ],
      };
      if (!isSearchK && min && max) {
        config.validations?.push({
          rule: 'range',
          errorText: warningTrans('range', { min, max }),
          extraParam: {
            min,
            max,
            type: 'number',
          },
        });
      }

      if (isInt) {
        config.validations?.push({
          rule: 'integer',
          errorText: warningTrans('integer', { name: label }),
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
        round_decimal: {
          label: 'Round Decimals',
          key: 'round_decimal',
          value: searchParamsForm['round_decimal'] || '',
          min: -1,
          max: 10,
          isInt: true,
          handleChange: value => {
            handleInputChange('round_decimal', value);
          },
          className: classes.inlineInput,
        },
        nprobe: {
          label: 'nprobe',
          key: 'nprobe',
          value: searchParamsForm['nprobe'] || '',
          min: 1,
          max: nlist,
          isInt: true,
          handleChange: value => {
            handleInputChange('nprobe', value);
          },
          className: classes.inlineInput,
        },

        ef: {
          label: 'ef',
          key: 'ef',
          value: searchParamsForm['ef'] || '',
          min: topK,
          max: 32768,
          isInt: true,
          handleChange: value => {
            handleInputChange('ef', value);
          },
        },
        search_k: {
          label: 'search_k',
          key: 'search_k',
          value: searchParamsForm['search_k'] || '',
          min: topK,
          // n * n_trees can be infinity
          max: Infinity,
          isInt: true,
          handleChange: value => {
            handleInputChange('search_k', value);
          },
        },
        search_length: {
          label: 'search_length',
          key: 'search_length',
          value: searchParamsForm['search_length'] || '',
          min: 10,
          max: 300,
          isInt: true,
          handleChange: value => {
            handleInputChange('search_length', value);
          },
        },
      };

      const param = configParamMap[paramKey];
      return getNumberInputConfig(param);
    },
    [
      indexParams,
      searchParamsForm,
      classes.inlineInput,
      topK,
      getNumberInputConfig,
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
  }, [searchParams, handleFormChange]);

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
      {/* metric type */}
      <CustomSelector
        options={metricOptions}
        value={metricType}
        label={indexTrans('metric')}
        wrapperClass={classes.selector}
        variant="filled"
        onChange={(e: { target: { value: unknown } }) => {
          const metricType = e.target.value as string;
          handleMetricTypeChange(metricType);
        }}
      />
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
