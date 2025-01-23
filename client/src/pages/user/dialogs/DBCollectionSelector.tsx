import { useState } from 'react';
import { Theme } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { CollectionService } from '@/http';
import CustomInput from '@/components/customInput/CustomInput';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';

export type CollectionOption = {
  name: string;
  value: string;
};
export type DBOption = {
  name: string;
  value: string;
};

interface DBCollectionsSelectorProps {
  selectedDB: DBOption;
  setSelectedDB: (value: DBOption) => void;
  selectedCollections: { [key: string]: CollectionOption[] };
  setSelectedCollections: (value: {
    [key: string]: CollectionOption[];
  }) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(1, 0, 0.5),
    display: 'flex',
    gap: theme.spacing(1),
  },
  selector: {
    flex: 1,
    maxWidth: '50%',
  },
}));

export default function DBCollectionsSelector(
  props: DBCollectionsSelectorProps
) {
  // styles
  const classes = useStyles();

  // i18n
  const { t: searchTrans } = useTranslation('search');
  const { t: userTrans } = useTranslation('user');

  // props
  const {
    selectedDB,
    setSelectedDB,
    selectedCollections,
    setSelectedCollections,
  } = props;
  // state
  const [openCollectionOpen, setCollectionOpen] = useState(false);
  const [dbOptions, setDBOptions] = useState<readonly DBOption[]>([]);
  const [openDbOpen, setDatabaseOpen] = useState(false);
  const [collectionOptions, setCollectionOptions] = useState<
    readonly CollectionOption[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleDBsOpen = () => {
    setDatabaseOpen(true);
    setLoading(true);
    (async () => {
      try {
        const res = ['default', 'Iterator_test_db'];
        const options = res.map(c => {
          return { name: c, value: c };
        });

        options.unshift({ name: userTrans('allDatabases'), value: '*' });

        setDBOptions([...options]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleCollectionsOpen = () => {
    setCollectionOpen(true);
    setLoading(true);
    (async () => {
      try {
        const res = await CollectionService.getCollectionsNames({
          db_name: selectedDB.name,
        });
        const options = res.map(c => {
          return { name: c, value: c };
        });

        options.unshift({ name: userTrans('allCollections'), value: '*' });

        // update collection options
        setCollectionOptions(options);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className={classes.root}>
      <Autocomplete
        className={classes.selector}
        open={openDbOpen}
        color="primary"
        disableCloseOnSelect
        onOpen={handleDBsOpen}
        onClose={() => {
          setDatabaseOpen(false);
        }}
        onChange={(_, value) => {
          if (!value) return;
          setSelectedDB(value!);
          setDatabaseOpen(false);
        }}
        value={selectedDB}
        isOptionEqualToValue={(option, value) => {
          return option && value && option.value === value.value;
        }}
        getOptionLabel={option => (option && option.name) || ''}
        options={dbOptions}
        loading={loading}
        renderInput={params => {
          return (
            <CustomInput
              textConfig={{
                ...params,
                label: userTrans('databases'),
                key: 'databases',
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
      {selectedDB.value !== '*' && (
        <Autocomplete
          className={classes.selector}
          open={openCollectionOpen}
          multiple
          limitTags={2}
          color="primary"
          disableCloseOnSelect
          onOpen={handleCollectionsOpen}
          onClose={() => {
            setCollectionOpen(false);
          }}
          onChange={(_, value) => {
            setSelectedCollections({
              ...selectedCollections,
              [selectedDB.value]: value,
            });
            // if value === '*', close the collection
            if (value.some(v => v.value === '*')) {
              setCollectionOpen(false);
            }
          }}
          value={selectedCollections[selectedDB.value] || []}
          isOptionEqualToValue={(option, value) => {
            return option && value && option.value === value.value;
          }}
          getOptionLabel={option => (option && option.name) || ''}
          options={collectionOptions}
          loading={loading}
          renderInput={params => {
            return (
              <CustomInput
                textConfig={{
                  ...params,
                  label: userTrans('collections'),
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
      )}
    </div>
  );
}
