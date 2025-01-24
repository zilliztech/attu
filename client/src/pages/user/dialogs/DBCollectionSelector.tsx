import { useState, useEffect } from 'react';
import { Theme, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { CollectionService } from '@/http';
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
  [key: string]: CollectionOption[];
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
  const classes = useStyles();
  const { t: searchTrans } = useTranslation('search');
  const { t: userTrans } = useTranslation('user');

  const {
    selectedDB = { name: '', value: '' },
    setSelectedDB,
    selectedCollections = {},
    setSelectedCollections,
  } = props;

  const [openCollectionOpen, setCollectionOpen] = useState(false);
  const [dbOptions, setDBOptions] = useState<readonly DBOption[]>([]);
  const [openDbOpen, setDatabaseOpen] = useState(false);
  const [collectionOptions, setCollectionOptions] = useState<
    readonly CollectionOption[]
  >([]);
  const [loading, setLoading] = useState(false);

  const ALL_DB = { name: userTrans('allDatabases'), value: '*' };
  const ALL_COLLECTIONS = { name: userTrans('allCollections'), value: '*' };

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

        setCollectionOptions(options);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDB && selectedDB.value) {
      fetchCollections();
    }
  }, [selectedDB]);

  const handleCollectionsOpen = () => {
    setCollectionOpen(true);
    fetchCollections();
  };

  // Filter out invalid values from selectedCollections[selectedDB.value]
  const validSelectedCollections = (
    selectedCollections[selectedDB.value] || []
  ).filter(selected =>
    collectionOptions.some(option => option.value === selected.value)
  );

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
            <TextField
              {...params}
              label={userTrans('databases')}
              variant="filled"
            />
          );
        }}
        noOptionsText={
          loading ? searchTrans('loading') : searchTrans('noOptions')
        }
      />

      <Autocomplete
        className={classes.selectorCollection}
        multiple
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
        value={validSelectedCollections} // Use filtered valid values
        isOptionEqualToValue={(option, value) => {
          return option && value && option.value === value.value;
        }}
        getOptionLabel={option => (option && option.name) || ''}
        options={collectionOptions}
        loading={loading}
        renderInput={params => {
          return (
            <TextField
              {...params}
              label={userTrans('collections')}
              variant="filled"
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
