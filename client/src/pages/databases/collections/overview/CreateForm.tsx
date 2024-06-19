import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITextfieldConfig } from '@/components/customInput/Types';
import CustomInput from '@/components/customInput/CustomInput';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { Option } from '@/components/customSelector/Types';
import { FormHelperType } from '../../../../types/Common';

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
    color: theme.palette.attuGrey.dark,
    lineHeight: '20px',
    fontSize: '14px',
  },
}));

const CreateForm = (
  props: FormHelperType & {
    metricOptions: Option[];
    indexOptions: Option[];
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
    const generateNumberConfig = (
      label: string,
      key: string,
      min: number,
      max: number
    ) => {
      const config: ITextfieldConfig = {
        label,
        key,
        onChange: value => {
          updateForm(key, value);
        },
        variant: 'filled',
        fullWidth: true,
        type: 'number',
        value: formValue[key],
        validations: [
          {
            rule: 'require',
            errorText: warningTrans('required', { name: label }),
          },
          {
            rule: 'range',
            errorText: warningTrans('range', { min, max }),
            extraParam: {
              min,
              max,
              type: 'number',
            },
          },
        ],
      };
      return config;
    };

    const paramsMap = {
      nlist: generateNumberConfig('nlist', 'nlist', 1, 65536),
      nbits: generateNumberConfig('nbits', 'nbits', 1, 16),
      M: generateNumberConfig('M', 'M', 1, 2048),
      efConstruction: generateNumberConfig(
        'Ef Construction',
        'efConstruction',
        1,
        2147483647
      ),
      n_trees: generateNumberConfig('nTrees', 'n_trees', 1, 1024),
      out_degree: generateNumberConfig('out_degree', 'out_degree', 5, 300),
      candidate_pool_size: generateNumberConfig(
        'candidate_pool_size',
        'candidate_pool_size',
        50,
        1000
      ),
      search_length: generateNumberConfig(
        'search_length',
        'search_length',
        10,
        300
      ),
      knng: generateNumberConfig('knng', 'knng', 5, 300),
      drop_ratio_build: generateNumberConfig(
        'drop_ratio_build',
        'drop_ratio_build',
        0,
        1
      ),
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
    defaultValue: '',
    value: formValue.index_name,
  };

  return (
    <div className={`${classes.wrapper} ${wrapperClass}`}>
      <CustomSelector
        label={indexTrans('type')}
        value={formValue.index_type}
        options={indexOptions}
        onChange={(e: { target: { value: unknown } }) => {
          const type = e.target.value;
          updateForm('index_type', type as string);
          // reset metric type value
          updateForm('metric_type', metricOptions[0].value as string);
          indexTypeChange && indexTypeChange(type as string);
        }}
        variant="filled"
        wrapperClass={classes.select}
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
