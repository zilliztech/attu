import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import { getQueryStyles } from './Styles';
import { CONSISTENCY_LEVEL_OPTIONS, TOP_K_OPTIONS } from '@/consts';

import CustomSelector from '@/components/customSelector/CustomSelector';

export interface CollectionDataProps {
  searchParamsForm: {
    [key in string]: number | string;
  };
  handleFormChange: (form: { [key in string]: number | string }) => void;
}

const SearchGlobalParams = (props: CollectionDataProps) => {
  // props
  const { searchParamsForm, handleFormChange } = props;

  // UI functions
  const handleInputChange = useCallback(
    (key: string, value: number | string) => {
      let form = { ...searchParamsForm };
      if (value === '') {
        delete form[key];
      } else {
        form = { ...searchParamsForm, [key]: value };
      }

      handleFormChange(form);
    },
    [handleFormChange, searchParamsForm]
  );

  // icons
  // translations
  const { t: warningTrans } = useTranslation('warning');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
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

  return (
    <>
      <CustomSelector
        options={TOP_K_OPTIONS}
        value={searchParamsForm.topK as string}
        label={collectionTrans('topK')}
        wrapperClass="selector"
        variant="filled"
        onChange={(e: { target: { value: unknown } }) => {
          const topK = e.target.value as string;
          handleInputChange('topK', topK);
        }}
      />

      <CustomSelector
        options={CONSISTENCY_LEVEL_OPTIONS}
        value={searchParamsForm.consistency_level as string}
        label={collectionTrans('consistencyLevel')}
        wrapperClass="selector"
        variant="filled"
        onChange={(e: { target: { value: unknown } }) => {
          const consistency = e.target.value as string;
          handleInputChange('consistency_level', consistency);
        }}
      />

      <CustomInput
        type="text"
        textConfig={roundInputConfig}
        checkValid={() => true}
      />
    </>
  );
};

export default SearchGlobalParams;
