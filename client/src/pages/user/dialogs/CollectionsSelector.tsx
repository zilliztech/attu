import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { CollectionService } from '@/http';
import CustomInput from '@/components/customInput/CustomInput';
import { useTranslation } from 'react-i18next';

interface CollectionsSelectorProps {
  db_name: string;
  selected: CollectionOption[];
  setSelected: (value: CollectionOption[]) => void;
}

export type CollectionOption = {
  name: string;
};

export default function CollectionsSelector(props: CollectionsSelectorProps) {
  // i18n
  const { t: searchTrans } = useTranslation('search');

  // props
  const { selected, setSelected } = props;
  // state
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly CollectionOption[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setLoading(true);
    (async () => {
      try {
        const res = await CollectionService.getCollectionsNames({
          db_name: props.db_name,
        });
        const options = res.map(c => {
          return { name: c };
        });

        setOptions([...options]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Autocomplete
      open={open}
      multiple
      limitTags={2}
      color="primary"
      disableCloseOnSelect
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={(_, value) => {
        setSelected(value);
      }}
      value={selected}
      isOptionEqualToValue={(option, value) => {
        return option && value && option.name === value.name;
      }}
      getOptionLabel={option => (option && option.name) || ''}
      options={options}
      loading={loading}
      renderInput={params => {
        return (
          <CustomInput
            textConfig={{
              ...params,
              label: 'collections',
              key: 'collections',
              className: 'input',
              value: params.inputProps.value,
              disabled: loading,
              variant: 'filled',
              required: false,
              InputLabelProps: { shrink: true },
            }}
            checkValid={() => true}
            type="text"
          />
        );
      }}
      noOptionsText={
        loading ? searchTrans('loading') : searchTrans('noOptions')
      }
    />
  );
}
