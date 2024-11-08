import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { PartitionService } from '@/http';
import { PartitionData } from '@server/types';
import CustomInput from '@/components/customInput/CustomInput';
import { useTranslation } from 'react-i18next';

interface PartitionsSelectorProps {
  collectionName: string;
  selected: PartitionData[];
  setSelected: (value: PartitionData[]) => void;
}

export default function PartitionsSelector(props: PartitionsSelectorProps) {
  // i18n
  const { t: searchTrans } = useTranslation('search');
  // default loading
  const DEFAULT_LOADING_OPTIONS: readonly PartitionData[] = [
    { name: searchTrans('loading'), id: -1, rowCount: -1, createdTime: '' },
  ];

  // props
  const { collectionName, selected, setSelected } = props;
  // state
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly PartitionData[]>(
    DEFAULT_LOADING_OPTIONS
  );
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      try {
        const res = await PartitionService.getPartitions(collectionName);
        setLoading(false);
        setOptions([...res]);
      } catch (err) {
        setLoading(false);
      }
    })();
  };

  const handleClose = () => {
    setOpen(false);
    setOptions(DEFAULT_LOADING_OPTIONS);
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
      isOptionEqualToValue={(option, value) =>
        option && value && option.name === value.name
      }
      getOptionLabel={option => (option && option.name) || ''}
      options={options}
      loading={loading}
      renderInput={params => {
        return loading ? (
          <CircularProgress color="inherit" size={20} />
        ) : (
          <CustomInput
            textConfig={{
              ...params,
              label: searchTrans('partitionFilter'),
              key: 'partitionFilter',
              className: 'input',
              value: params.inputProps.value,
              disabled: false,
              variant: 'filled',
              required: false,
              InputLabelProps: { shrink: true },
            }}
            checkValid={() => true}
            type="text"
          />
        );
      }}
    />
  );
}
