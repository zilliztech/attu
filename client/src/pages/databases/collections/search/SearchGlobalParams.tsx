import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@material-ui/core';
import CustomInput from '@/components/customInput/CustomInput';
import CustomSelector from '@/components/customSelector/CustomSelector';
import { getQueryStyles } from './Styles';
import {
  CONSISTENCY_LEVEL_OPTIONS,
  TOP_K_OPTIONS,
  RERANKER_OPTIONS,
} from '@/consts';
import { SearchParams, GlobalParams } from '../../types';

export interface CollectionDataProps {
  searchGlobalParams: GlobalParams;
  searchParams: SearchParams;
  handleFormChange: (form: GlobalParams) => void;
  onSlideChange: (field: string) => void;
  onSlideChangeCommitted: () => void;
}

const SearchGlobalParams = (props: CollectionDataProps) => {
  // props
  const {
    searchParams,
    searchGlobalParams,
    handleFormChange,
    onSlideChange,
    onSlideChangeCommitted,
  } = props;
  const selectedCount = searchParams.searchParams.filter(
    sp => sp.selected
  ).length;
  const showReranker = selectedCount > 1;

  // translations
  const { t: warningTrans } = useTranslation('warning');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: searchTrans } = useTranslation('search');

  // UI functions
  const handleInputChange = useCallback(
    <K extends keyof GlobalParams>(key: K, value: GlobalParams[K]) => {
      let form = { ...searchGlobalParams };
      if (value === '') {
        delete form[key];
      } else {
        form = { ...searchGlobalParams, [key]: value };
      }

      handleFormChange(form);
    },
    [handleFormChange, searchGlobalParams]
  );

  const onRerankChanged = useCallback(
    (e: { target: { value: unknown } }) => {
      const rerankerStr = e.target.value as string;

      const rerank = {
        strategy: rerankerStr,
        params: {},
      };
      if (rerankerStr === 'weighted') {
        rerank.params = {
          weights: Array(selectedCount).fill(0.5),
        };
      }

      if (rerankerStr === 'rrf') {
        rerank.params = {
          k: 60,
        };
      }
      handleInputChange('rerank', rerank);
    },
    [selectedCount, handleInputChange]
  );

  // update rerank params if selected count changes
  useEffect(() => {
    if (searchGlobalParams.rerank) {
      onRerankChanged({
        target: { value: searchGlobalParams.rerank.strategy },
      });
    }
  }, [selectedCount]);

  return (
    <>
      <CustomSelector
        options={TOP_K_OPTIONS}
        value={searchGlobalParams.topK}
        label={collectionTrans('topK')}
        wrapperClass="selector"
        variant="filled"
        onChange={(e: { target: { value: unknown } }) => {
          const topK = e.target.value as number;
          handleInputChange('topK', topK);
        }}
      />
      <CustomSelector
        options={CONSISTENCY_LEVEL_OPTIONS}
        value={searchGlobalParams.consistency_level}
        label={collectionTrans('consistency')}
        wrapperClass="selector"
        variant="filled"
        onChange={(e: { target: { value: unknown } }) => {
          const consistency = e.target.value as string;
          handleInputChange('consistency_level', consistency);
        }}
      />

      {showReranker && (
        <>
          <CustomSelector
            options={RERANKER_OPTIONS}
            value={
              searchGlobalParams.rerank
                ? searchGlobalParams.rerank.strategy
                : RERANKER_OPTIONS[0].value
            }
            label={searchTrans('rerank')}
            wrapperClass="selector"
            variant="filled"
            onChange={onRerankChanged}
          />

          {(!searchGlobalParams.rerank?.strategy ||
            searchGlobalParams.rerank.strategy == 'rrf') && (
            <CustomInput
              type="text"
              textConfig={{
                label: 'K',
                key: 'k',
                onChange: value => {
                  console.log('update', value);
                },
                variant: 'filled',
                placeholder: 'k',
                fullWidth: true,
                validations: [
                  {
                    rule: 'require',
                    errorText: warningTrans('required', {
                      name: 'k',
                    }),
                  },
                ],
                defaultValue: 60,
              }}
              checkValid={() => true}
            />
          )}

          {searchGlobalParams.rerank?.strategy == 'weighted' &&
            searchParams.searchParams
              .filter(s => s.selected)
              .map(s => {
                return (
                  <Slider
                    key={s.anns_field}
                    color="secondary"
                    defaultValue={0.5}
                    getAriaValueText={value => {
                      return `${s.anns_field}'s weight: ${value}`;
                    }}
                    onChange={() => {
                      onSlideChange(s.anns_field);
                    }}
                    onChangeCommitted={() => {
                      onSlideChangeCommitted();
                    }}
                    aria-labelledby="weight-slider"
                    valueLabelDisplay="auto"
                    step={0.1}
                    min={0}
                    max={1}
                  />
                );
              })}
        </>
      )}
    </>
  );
};

export default SearchGlobalParams;
