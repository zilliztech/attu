import { useState, useEffect } from 'react'; // Add useEffect
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

export type RolePrivileges = {
  [key: string]: CollectionOption;
};

interface DBCollectionsSelectorProps {
  selectedDB?: DBOption;
  setSelectedDB: (value: DBOption) => void;
  selectedCollections?: RolePrivileges;
  setSelectedCollections: (value: RolePrivileges) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(1, 0, 0.5),
    display: 'flex',
    gap: theme.spacing(1),
  },
  selectorDB: {
    flex: 1,
    maxWidth: '33%',
  },
  selectorCollection: {
    flex: 1,
    maxWidth: '66%',
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
    selectedDB = { name: '', value: '' }, // Default value for selectedDB
    setSelectedDB,
    selectedCollections = {}, // Default value for selectedCollections
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

  // const
  const ALL_DB = { name: userTrans('allDatabases'), value: '*' };
  const ALL_COLLECTIONS = { name: userTrans('allCollections'), value: '*' };

  // Fetch DB options when the DB selector is opened
  const handleDBsOpen = () => {
    setDatabaseOpen(true);
    setLoading(true);
    (async () => {
      try {
        const res = ['default', 'Iterator_test_db'];
        const options = res.map(c => {
          return { name: c, value: c };
        });

        options.unshift(ALL_DB);

        setDBOptions([...options]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  };

  // Fetch collection options when the collection selector is opened or when selectedDB changes
  const fetchCollections = async () => {
    setLoading(true);
    try {
      if (selectedDB.value === '*') {
        setCollectionOptions([ALL_COLLECTIONS]);
      } else {
        const res = await CollectionService.getCollectionsNames({
          db_name: selectedDB.name,
        });
        const options = res.map(c => {
          return { name: c, value: c };
        });

        options.unshift(ALL_COLLECTIONS);

        // Update collection options
        setCollectionOptions(options);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch collections when selectedDB changes
  useEffect(() => {
    if (selectedDB && selectedDB.value) {
      fetchCollections();
    }
  }, [selectedDB]); // Add selectedDB as a dependency

  const handleCollectionsOpen = () => {
    setCollectionOpen(true);
    fetchCollections(); // Fetch collections when the selector is opened
  };

  return (
    <div className={classes.root}>
      <Autocomplete
        className={classes.selectorDB}
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

      <Autocomplete
        className={classes.selectorCollection}
        open={openCollectionOpen}
        limitTags={2}
        color="primary"
        disableCloseOnSelect
        onOpen={handleCollectionsOpen}
        onClose={() => {
          setCollectionOpen(false);
        }}
        onChange={(_, value) => {
          if (!value) return;
          setSelectedCollections({
            ...selectedCollections,
            [selectedDB.value]: value,
          });
          setCollectionOpen(false);
        }}
        value={
          collectionOptions.find(
            option =>
              option.value === selectedCollections[selectedDB.value]?.value
          ) || null
        } // Ensure the value exists in the options
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
    </div>
  );
}
