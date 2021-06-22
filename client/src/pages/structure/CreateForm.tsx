import { makeStyles, Theme, Typography } from '@material-ui/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITextfieldConfig } from '../../components/customInput/Types';
import CustomInput from '../../components/customInput/CustomInput';
import CustomSelector from '../../components/customSelector/CustomSelector';
import { m_OPTIONS } from '../../consts/Milvus';
import { FormHelperType } from '../../types/Common';
import { Option } from '../../components/customSelector/Types';

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
    color: '#82838e',
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
  } = props;

  const { t } = useTranslation();
  const { t: indexTrans } = useTranslation('index');
  const { t: warningTrans } = useTranslation('warning');

  const paramsConfig: ITextfieldConfig[] = useMemo(() => {
    const result = [];
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

    const nlist = generateNumberConfig('nlist', 'nlist', 1, 65536);
    const nTrees = generateNumberConfig('nTrees', 'n_trees', 1, 1024);

    const M = generateNumberConfig('M', 'M', 4, 64);
    const efConstruction = generateNumberConfig(
      'Ef Construction',
      'efConstruction',
      8,
      512
    );

    const outDegree = generateNumberConfig('out_degree', 'out_degree', 5, 300);
    const candidatePoolSize = generateNumberConfig(
      'candidate_pool_size',
      'candidate_pool_size',
      50,
      1000
    );
    const searchLength = generateNumberConfig(
      'search_length',
      'search_length',
      10,
      300
    );
    const knng = generateNumberConfig('knng', 'knng', 5, 300);

    if (indexParams.includes('nlist')) {
      result.push(nlist);
    }

    if (indexParams.includes('M')) {
      result.push(M);
    }

    if (indexParams.includes('efConstruction')) {
      result.push(efConstruction);
    }

    if (indexParams.includes('n_trees')) {
      result.push(nTrees);
    }

    if (indexParams.includes('out_degree')) {
      result.push(outDegree);
    }

    if (indexParams.includes('candidate_pool_size')) {
      result.push(candidatePoolSize);
    }

    if (indexParams.includes('search_length')) {
      result.push(searchLength);
    }

    if (indexParams.includes('knng')) {
      result.push(knng);
    }

    return result;
  }, [updateForm, warningTrans, indexParams, formValue]);
  return (
    <div className={classes.wrapper}>
      <CustomSelector
        label={indexTrans('type')}
        value={formValue.index_type}
        options={indexOptions}
        onChange={(e: { target: { value: unknown } }) => {
          const type = e.target.value;
          updateForm('index_type', type as string);
          // reset metric type value
          updateForm('metric_type', 'L2');
          indexTypeChange && indexTypeChange(type as string);
        }}
        variant="filled"
        classes={{ root: classes.select }}
      />

      <Typography className={classes.paramTitle}>{t('param')}</Typography>
      <CustomSelector
        label={indexTrans('metric')}
        value={formValue.metric_type}
        options={metricOptions}
        onChange={(e: { target: { value: unknown } }) => {
          const type = e.target.value;
          updateForm('metric_type', type as string);
        }}
        variant="filled"
        classes={{ root: classes.select }}
      />

      {indexParams.includes('m') && (
        <CustomSelector
          label="m"
          value={Number(formValue.m)}
          options={m_OPTIONS}
          onChange={(e: { target: { value: unknown } }) =>
            updateForm('m', e.target.value as string)
          }
          variant="filled"
          classes={{ root: classes.select }}
        />
      )}

      {paramsConfig.map(v => (
        <CustomInput
          type="text"
          textConfig={v}
          checkValid={checkIsValid}
          validInfo={validation}
          key={v.label}
        />
      ))}
    </div>
  );
};
export default CreateForm;
