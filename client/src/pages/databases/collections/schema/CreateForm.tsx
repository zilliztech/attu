import { Theme, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITextfieldConfig } from '@/components/customInput/Types';
import CustomInput from '@/components/customInput/CustomInput';
import CustomSelector from '@/components/customSelector/CustomSelector';
import CustomGroupedSelect from '@/components/customSelector/CustomGroupedSelect';
import type { FormHelperType } from '../../../../types/Common';
import { makeStyles } from '@mui/styles';
import type { Option, GroupOption } from '@/components/customSelector/Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    maxWidth: '480px',
  },
  select: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  paramTitle: {
    margin: theme.spacing(2, 0),
    color: theme.palette.text.secondary,
    lineHeight: '20px',
    fontSize: '14px',
  },
}));

const CreateForm = (
  props: FormHelperType & {
    metricOptions: Option[];
    indexOptions: GroupOption[];
    indexParams: string[];
    indexTypeChange?: (type: string) => void;
  }
) => {
  const classes = useStyles();
  const {
    updateForm,
    formValue,
    checkIsValid,
    validation,
    indexParams,
    indexTypeChange,
    indexOptions,
    metricOptions,
    wrapperClass,
  } = props;

  const { t: commonTrans } = useTranslation();
  const { t: indexTrans } = useTranslation('index');
  const { t: warningTrans } = useTranslation('warning');

  const paramsConfig: ITextfieldConfig[] = useMemo(() => {
    const generateConfig = (props: {
      label: string;
      key: string;
      min?: number;
      max?: number;
      type?: 'number' | 'text' | 'password' | 'bool';
    }) => {
      const { label, key, min, max, type = 'number' } = props;
      const config: ITextfieldConfig = {
        label,
        key,
        onChange: value => {
          updateForm(key, value);
        },
        variant: 'filled',
        fullWidth: true,
        type: type,
        value: formValue[key],
        validations: [
          {
            rule: 'require',
            errorText: warningTrans('required', { name: label }),
          },
        ],
      };

      if (type === 'number') {
        config.validations!.push({
          rule: 'number',
          errorText: warningTrans('number', { name: label }),
        });
      }
      if (
        type === 'number' &&
        typeof min === 'number' &&
        typeof max === 'number'
      ) {
        config.validations!.push({
          rule: 'range',
          errorText: warningTrans('range', { min, max }),
          extraParam: {
            min,
            max,
            type: 'number',
          },
        });
      }

      if (type === 'bool') {
        config.validations!.push({
          rule: 'bool',
          errorText: warningTrans('bool', { name: label }),
        });
      }
      return config;
    };

    const paramsMap = {
      nlist: generateConfig({
        label: 'nlist',
        key: 'nlist',
        min: 1,
        max: 65536,
      }),
      nbits: generateConfig({
        label: 'nbits',
        key: 'nbits',
        min: 1,
        max: 16,
      }),
      M: generateConfig({ label: 'M', key: 'M', min: 2, max: 2048 }),
      efConstruction: generateConfig({
        label: 'efConstruction',
        key: 'efConstruction',
        min: 1,
        max: 2147483647,
      }),
      n_trees: generateConfig({
        label: 'n_trees',
        key: 'n_trees',
        min: 1,
        max: 1024,
      }),
      out_degree: generateConfig({
        label: 'out_degree',
        key: 'out_degree',
        min: 5,
        max: 300,
      }),
      candidate_pool_size: generateConfig({
        label: 'candidate_pool_size',
        key: 'candidate_pool_size',
        min: 50,
        max: 1000,
      }),
      search_length: generateConfig({
        label: 'search_length',
        key: 'search_length',
        min: 10,
        max: 300,
      }),
      knng: generateConfig({
        label: 'knng',
        key: 'knng',
        min: 5,
        max: 300,
      }),
      drop_ratio_build: generateConfig({
        label: 'drop_ratio_build',
        key: 'drop_ratio_build',
        min: 0,
        max: 1,
      }),
      with_raw_data: generateConfig({
        label: 'with_raw_data',
        key: 'with_raw_data',
        type: 'bool',
      }),
      intermediate_graph_degree: generateConfig({
        label: 'intermediate_graph_degree',
        key: 'intermediate_graph_degree',
      }),
      graph_degree: generateConfig({
        label: 'graph_degree',
        key: 'graph_degree',
      }),
      build_algo: generateConfig({
        label: 'build_algo',
        key: 'build_algo',
        type: 'text',
      }),
      cache_dataset_on_device: generateConfig({
        label: 'cache_dataset_on_device',
        key: 'cache_dataset_on_device',
        type: 'bool',
      }),
    };

    const result: ITextfieldConfig[] = [];

    indexParams.forEach(param => {
      if (paramsMap.hasOwnProperty(param)) {
        result.push(paramsMap[param as keyof typeof paramsMap]);
      }
    });

    return result;
  }, [updateForm, warningTrans, indexParams, formValue]);

  const indexNameConfig: ITextfieldConfig = {
    label: indexTrans('indexName'),
    key: 'index_name',
    onChange: (value: string) => updateForm('index_name', value),
    variant: 'filled',
    fullWidth: true,
    validations: [],
    defaultValue: formValue.index_name,
  };

  return (
    <div className={`${classes.wrapper} ${wrapperClass}`}>
      <CustomGroupedSelect
        label={indexTrans('type')}
        options={indexOptions}
        value={formValue.index_type}
        onChange={(e: { target: { value: unknown } }) => {
          const type = e.target.value;
          updateForm('index_type', type as string);
          // reset metric type value
          if (metricOptions[0]) {
            updateForm('metric_type', metricOptions[0].value as string);
          }
          indexTypeChange && indexTypeChange(type as string);
        }}
        className={classes.select}
      />
      <CustomInput
        type="text"
        textConfig={indexNameConfig}
        checkValid={checkIsValid}
        validInfo={validation}
      />
      {metricOptions.length ? (
        <Typography className={classes.paramTitle}>
          {commonTrans('param')}
        </Typography>
      ) : null}

      {metricOptions.length ? (
        <CustomSelector
          label={indexTrans('metric')}
          value={formValue.metric_type}
          options={metricOptions}
          onChange={(e: { target: { value: unknown } }) => {
            const type = e.target.value;
            updateForm('metric_type', type as string);
          }}
          variant="filled"
          wrapperClass={classes.select}
        />
      ) : null}

      {paramsConfig.length
        ? paramsConfig.map(v => (
            <CustomInput
              type="text"
              textConfig={v}
              checkValid={checkIsValid}
              validInfo={validation}
              key={v.label}
            />
          ))
        : null}
    </div>
  );
};
export default CreateForm;
