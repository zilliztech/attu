import { makeStyles, Theme } from '@material-ui/core';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '../../components/customSelector/CustomSelector';
import { Option } from '../../components/customSelector/Types';
import { INDEX_CONFIG, METRIC_OPTIONS_MAP } from '../../consts/Milvus';
import { SearchParamsProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  selector: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
}));

const SearchParams: FC<SearchParamsProps> = ({
  indexType,
  searchParamsForm,
  handleFormChange,
  embeddingType,
  metricType,
  wrapperClass = '',
}) => {
  const { t: indexTrans } = useTranslation('index');
  const classes = getStyles();

  const metricOptions: Option[] = METRIC_OPTIONS_MAP[embeddingType];
  const searchParams = useMemo(() => {
    if (indexType !== '') {
      const param = INDEX_CONFIG[indexType].search;
      console.log('===== 30 param', param);
      return param;
    }
  }, [indexType]);
  console.log('search params', searchParams);

  return (
    <div className={wrapperClass}>
      <CustomSelector
        options={metricOptions}
        value={metricType}
        label={indexTrans('metric')}
        wrapperClass={classes.selector}
        variant="filled"
        onChange={(e: { target: { value: unknown } }) => {
          const metric = e.target.value;
          console.log('metric', metric);
        }}
        // not selectable now
        readOnly={true}
      />
    </div>
  );
};

export default SearchParams;
