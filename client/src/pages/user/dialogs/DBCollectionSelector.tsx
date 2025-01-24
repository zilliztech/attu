import { useState, useEffect } from 'react';
import {
  Theme,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { CollectionService } from '@/http';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';
import type { RBACOptions } from '../Types';

export type Privilege = {
  [key: string]: boolean; // key: privilege name, value: whether it's selected
};

export type CollectionPrivileges = {
  [collectionValue: string]: Privilege; // key: collection value, value: privileges
};

export type DBPrivileges = {
  collections: CollectionPrivileges; // Collection-level privileges
};

export type DBCollectionsPrivileges = {
  [dbValue: string]: DBPrivileges; // key: DB value, value: DB privileges and collections
};

export type CollectionOption = {
  name: string;
  value: string;
};

export type DBOption = {
  name: string;
  value: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(1, 0, 0.5),
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(1),
    height: '100%',
  },
  dbCollections: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: '33%',
    height: '100%',
  },
  selectorDB: {
    flex: 1,
  },
  selectorCollection: {
    flex: 1,
  },
  privileges: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: '66%',
    height: '340px',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
  },
}));

interface DBCollectionsSelectorProps {
  selected: DBCollectionsPrivileges; // Current selected DBs and their collections with privileges
  setSelected: (
    value:
      | DBCollectionsPrivileges
      | ((prev: DBCollectionsPrivileges) => DBCollectionsPrivileges)
  ) => void;
  // Callback to update selected state
  options: {
    rbacOptions: RBACOptions; // Available RBAC options (privileges)
    dbOptions: DBOption[]; // Available databases
  };
}

export default function DBCollectionsSelector(
  props: DBCollectionsSelectorProps
) {
  // Props
  const { selected, setSelected, options } = props;
  const { rbacOptions, dbOptions } = options;
  // Styles
  const classes = useStyles();
  // i18n
  const { t: searchTrans } = useTranslation('search');
  const { t: userTrans } = useTranslation('user');

  // UI states
  const [selectedDB, setSelectedDB] = useState<DBOption | null>(null); // Initialize with null or a default DBOption
  const [selectedCollection, setSelectedCollection] = useState<string>('*'); // Initialize with an empty string
  const [collectionOptions, setCollectionOptions] = useState<
    CollectionOption[]
  >([]);
  const [loading, setLoading] = useState(false);

  // const
  const ALL_COLLECTIONS = { name: userTrans('allCollections'), value: '*' };

  // select database when options changes
  useEffect(() => {
    if (selectedDB === null && dbOptions.length > 0) {
      setSelectedDB(options.dbOptions[0]);
    }
  }, [options]);

  // Fetch collections when selected DB changes
  useEffect(() => {
    const fetchCollections = async (dbName: string) => {
      setLoading(true);
      try {
        if (dbName === '*') {
          setCollectionOptions([ALL_COLLECTIONS]);
        } else {
          const res = await CollectionService.getCollectionsNames({
            db_name: dbName,
          });
          const options = res.map(c => ({ name: c, value: c }));
          options.unshift(ALL_COLLECTIONS);
          setCollectionOptions(options);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDB) {
      fetchCollections(selectedDB.value);
    }
  }, [selectedDB]);

  // Handle DB selection
  const handleDBChange = (db: DBOption) => {
    setSelectedDB(db);

    // Update the selected state with the new DB, but preserve existing privileges
    setSelected(prevSelected => {
      const newSelected = { ...prevSelected } as DBCollectionsPrivileges;

      // If the selected DB already exists in the state, keep its collections and privileges
      if (!newSelected[db.value]) {
        newSelected[db.value] = {
          collections: {},
        };
      }

      setSelectedCollection('*');

      return newSelected;
    });
  };

  // Handle collection selection
  const handleCollectionChange = (collection: CollectionOption | null) => {
    if (collection) {
      setSelectedCollection(collection.value);
    }
  };

  // Handle privilege change for a collection
  const handlePrivilegeChange = (
    collectionValue: string,
    privilegeName: string,
    checked: boolean
  ) => {
    // Use the currently selected DB, not the first key in the selected object
    const selectedDBValue = selectedDB?.value;
    if (!selectedDBValue) return;

    // Create a deep copy of the entire selected state
    const newSelected = { ...selected };

    // Ensure the selected DB exists in the new state
    if (!newSelected[selectedDBValue]) {
      newSelected[selectedDBValue] = { collections: {} };
    }

    // Ensure the selected collection exists in the new state
    if (!newSelected[selectedDBValue].collections[collectionValue]) {
      newSelected[selectedDBValue].collections[collectionValue] = {};
    }

    // Update the privilege for the selected collection
    newSelected[selectedDBValue].collections[collectionValue][privilegeName] =
      checked;

    // Update the state with the new selected state
    setSelected(newSelected);

    console.log(newSelected);
  };

  return (
    <div className={classes.root}>
      <div className={classes.dbCollections}>
        <Autocomplete
          className={classes.selectorDB}
          options={dbOptions}
          loading={loading}
          value={selectedDB || null}
          onChange={(_, value) => {
            if (!value) return;
            handleDBChange(value);
          }}
          getOptionLabel={option => option.name || ''}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={params => (
            <TextField
              {...params}
              label={userTrans('databases')}
              variant="filled"
            />
          )}
          noOptionsText={
            loading ? searchTrans('loading') : searchTrans('noOptions')
          }
        />

        <Autocomplete
          className={classes.selectorCollection}
          options={collectionOptions}
          loading={loading}
          value={
            collectionOptions.find(
              option => option.value === selectedCollection
            ) || null
          }
          onChange={(_, value) => {
            if (!value) return;
            handleCollectionChange(value);
          }}
          getOptionLabel={option => option.name || ''}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={params => (
            <TextField
              {...params}
              label={userTrans('collections')}
              variant="filled"
            />
          )}
          noOptionsText={
            loading ? searchTrans('loading') : searchTrans('noOptions')
          }
        />
      </div>

      <div className={classes.privileges}>
        {selectedDB && selectedCollection && (
          <div>
            {Object.entries(rbacOptions).map(
              ([category, categoryPrivileges]) => (
                <div key={category}>
                  <Typography variant="subtitle1" gutterBottom>
                    {category}
                  </Typography>
                  {Object.entries(categoryPrivileges).map(([privilegeName]) => (
                    <FormControlLabel
                      key={privilegeName}
                      control={
                        <Checkbox
                          checked={
                            selected[selectedDB.value].collections[
                              selectedCollection
                            ]?.[privilegeName] || false
                          }
                          onChange={e =>
                            handlePrivilegeChange(
                              selectedCollection,
                              privilegeName,
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={privilegeName}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
