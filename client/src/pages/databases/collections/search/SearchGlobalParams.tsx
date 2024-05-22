import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
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
}

const SearchGlobalParams = (props: CollectionDataProps) => {
  // props
  const { searchParams, searchGlobalParams, handleFormChange } = props;

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
  // icons
  // translations
  const { t: warningTrans } = useTranslation('warning');
  const { t: collectionTrans } = useTranslation('collection');
  // classes
  const classes = getQueryStyles();

  const roundInputConfig: ITextfieldConfig = {
    label: collectionTrans('round'),
    key: 'round',
    onChange: value => {
      handleInputChange('round_decimal', value);
    },
    variant: 'filled',
    placeholder: 'round_decimal',
    fullWidth: true,
    validations: [
      {
        rule: 'require',
        errorText: warningTrans('required', {
          name: collectionTrans('name'),
        }),
      },
      {
        rule: 'collectionName',
        errorText: collectionTrans('nameContentWarning'),
      },
    ],
    defaultValue: '0',
  };

  const selectedCount = searchParams.searchParams.filter(
    sp => sp.selected
  ).length;
  const showReranker = selectedCount > 1;

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
        <CustomSelector
          options={RERANKER_OPTIONS}
          value={
            searchGlobalParams.rerank
              ? searchGlobalParams.rerank.strategy
              : RERANKER_OPTIONS[0].value
          }
          label={collectionTrans('reranker')}
          wrapperClass="selector"
          variant="filled"
          onChange={(e: { target: { value: unknown } }) => {
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
          }}
        />
      )}
      <CustomInput
        type="text"
        textConfig={roundInputConfig}
        checkValid={() => true}
      />
    </>
  );
};

export default SearchGlobalParams;
