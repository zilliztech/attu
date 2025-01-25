import { useState, useEffect } from 'react';
import {
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { CollectionService } from '@/http';
import { useTranslation } from 'react-i18next';
import { useDBCollectionSelectorStyle } from './styles';
import type {
  DBOption,
  CollectionOption,
  DBCollectionsPrivileges,
  DBCollectionsSelectorProps,
} from './types';

export default function DBCollectionsSelector(
  props: DBCollectionsSelectorProps
) {
  // Props
  const { selected, setSelected, options } = props;
  const { rbacOptions, dbOptions } = options;
  // Styles
  const classes = useDBCollectionSelectorStyle();
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
  const [updateCollectionOptionTrigger, setUpdateCollectionOptionTrigger] =
    useState<number>(0);

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
      let options: CollectionOption[] = [];
      try {
        if (dbName === '*') {
          options = [ALL_COLLECTIONS];
        } else {
          const res = await CollectionService.getCollectionsNames({
            db_name: dbName,
          });
          options = res.map(c => ({ name: c, value: c }));
          options.unshift(ALL_COLLECTIONS);
        }
        // Update the collection options
        setCollectionOptions(options);
        setUpdateCollectionOptionTrigger(prev => prev + 1);
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

  // handle selected change
  useEffect(() => {
    // Check if selectedDB is available
    if (!selectedDB) return;

    // Update collection options label when selected changes
    setCollectionOptions(prevOptions =>
      prevOptions.map(option => {
        // Calculate the total privilege count for the current collection
        let privilegeCount = 0;

        // Iterate through all privilege categories in rbacOptions
        Object.values(rbacOptions).forEach(categoryPrivileges => {
          privilegeCount += Object.keys(categoryPrivileges).filter(
            privilege => {
              return selected[selectedDB.value]?.collections[option.value]?.[
                privilege
              ];
            }
          ).length;
        });

        // Remove existing parentheses and numbers from the name (if any)
        const baseName = option.name.replace(/\s*\(\d+\)\s*$/, '');

        // Update the collection name with the privilege count (if count > 0)
        return {
          ...option,
          name:
            privilegeCount > 0 ? `${baseName} (${privilegeCount})` : baseName,
        };
      })
    );
  }, [selected, selectedDB, rbacOptions, updateCollectionOptionTrigger]);

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

  // Handle select all privileges in a category
  const handleSelectAll = (
    category: string,
    collectionValue: string,
    checked: boolean
  ) => {
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

    // Update all privileges in the category
    Object.keys(rbacOptions[category]).forEach(privilegeName => {
      newSelected[selectedDBValue].collections[collectionValue][privilegeName] =
        checked;
    });

    // Update the state with the new selected state
    setSelected(newSelected);
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
                  <div className={classes.categoryHeader}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Object.keys(categoryPrivileges).every(
                            privilegeName =>
                              selected[selectedDB.value].collections[
                                selectedCollection
                              ]?.[privilegeName]
                          )}
                          onChange={e =>
                            handleSelectAll(
                              category,
                              selectedCollection,
                              e.target.checked
                            )
                          }
                          size="small"
                          className={classes.selectAllCheckbox}
                          title={userTrans('selectAll')}
                        />
                      }
                      label=""
                    />
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      className={classes.privilegeTitle}
                    >
                      {userTrans(category)}
                    </Typography>
                  </div>
                  <div className={classes.categoryBody}>
                    {Object.entries(categoryPrivileges).map(
                      ([privilegeName]) => (
                        <FormControlLabel
                          key={privilegeName}
                          control={
                            <Checkbox
                              className={classes.checkbox}
                              checked={
                                selected[selectedDB.value].collections[
                                  selectedCollection
                                ]?.[privilegeName] || false
                              }
                              size="small"
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
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
