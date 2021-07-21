import { makeStyles, Theme } from '@material-ui/core';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelector from '../../components/customSelector/CustomSelector';
import { Option } from '../../components/customSelector/Types';
import { METRIC_OPTIONS_MAP } from '../../consts/Milvus';
import { SearchParamsProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  selector: {
    // minWidth: '218px',
    flexBasis: '32%',
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
