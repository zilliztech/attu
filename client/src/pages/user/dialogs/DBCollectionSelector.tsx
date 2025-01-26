import { useState, useEffect, useCallback } from 'react';
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
  const [selectedDB, setSelectedDB] = useState<DBOption | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('*');
  const [collectionOptions, setCollectionOptions] = useState<CollectionOption[]>([]);
  const [loading, setLoading] = useState(false);

  // const
  const ALL_COLLECTIONS = { name: userTrans('allCollections'), value: '*' };

  // Calculate privilege count for a collection
  const calculatePrivilegeCount = useCallback(
    (collectionValue: string) => {
      if (!selectedDB) return 0;

      let privilegeCount = 0;
      Object.values(rbacOptions).forEach(categoryPrivileges => {
        privilegeCount += Object.keys(categoryPrivileges).filter(privilege => {
          return selected[selectedDB.value]?.collections[collectionValue]?.[privilege];
        }).length;
      });
      return privilegeCount;
    },
    [selected, selectedDB, rbacOptions]
  );

  // Update collection options with privilege counts
  const updateCollectionOptionsWithPrivileges = useCallback(
    (options: CollectionOption[]) => {
      return options.map(option => {
        const privilegeCount = calculatePrivilegeCount(option.value);
        const baseName = option.name.replace(/\s*\(\d+\)\s*$/, '');
        return {
          ...option,
          name: privilegeCount > 0 ? `${baseName} (${privilegeCount})` : baseName,
        };
      });
    },
    [calculatePrivilegeCount]
  );

  // Fetch collections when selected DB changes
  const fetchCollections = useCallback(
    async (dbName: string) => {
      setLoading(true);
      try {
        let options: CollectionOption[] = [];
        if (dbName === '*') {
          options = [ALL_COLLECTIONS];
        } else {
          const res = await CollectionService.getCollectionsNames({
            db_name: dbName,
          });
          options = res.map(c => ({ name: c, value: c }));
          options.unshift(ALL_COLLECTIONS);
        }
        // Update collection options with privilege counts
        const updatedOptions = updateCollectionOptionsWithPrivileges(options);
        setCollectionOptions(updatedOptions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [updateCollectionOptionsWithPrivileges]
  );

  // Initialize selectedDB and fetch collections when dbOptions changes
  useEffect(() => {
    if (dbOptions.length > 0 && selectedDB === null) {
      const initialDB = dbOptions[0];
      setSelectedDB(initialDB);
      fetchCollections(initialDB.value);
    }
  }, [dbOptions, selectedDB, fetchCollections]);

  // Update collection options when selected changes
  useEffect(() => {
    if (selectedDB) {
      const updatedOptions = updateCollectionOptionsWithPrivileges(collectionOptions);
      setCollectionOptions(updatedOptions);
    }
  }, [selected, selectedDB, updateCollectionOptionsWithPrivileges, collectionOptions]);

  // Handle DB selection
  const handleDBChange = (db: DBOption) => {
    setSelectedDB(db);
    setSelected(prevSelected => {
      const newSelected = { ...prevSelected } as DBCollectionsPrivileges;
      if (!newSelected[db.value]) {
        newSelected[db.value] = { collections: {} };
      }
      setSelectedCollection('*');
      return newSelected;
    });
    fetchCollections(db.value);
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
    const selectedDBValue = selectedDB?.value;
    if (!selectedDBValue) return;

    const newSelected = { ...selected };
    if (!newSelected[selectedDBValue]) {
      newSelected[selectedDBValue] = { collections: {} };
    }
    if (!newSelected[selectedDBValue].collections[collectionValue]) {
      newSelected[selectedDBValue].collections[collectionValue] = {};
    }
    newSelected[selectedDBValue].collections[collectionValue][privilegeName] = checked;
    setSelected(newSelected);
  };

  // Handle select all privileges in a category
  const handleSelectAll = (
    category: string,
    collectionValue: string,
    checked: boolean
  ) => {
    const selectedDBValue = selectedDB?.value;
    if (!selectedDBValue) return;

    const newSelected = { ...selected };
    if (!newSelected[selectedDBValue]) {
      newSelected[selectedDBValue] = { collections: {} };
    }
    if (!newSelected[selectedDBValue].collections[collectionValue]) {
      newSelected[selectedDBValue].collections[collectionValue] = {};
    }
    Object.keys(rbacOptions[category]).forEach(privilegeName => {
      newSelected[selectedDBValue].collections[collectionValue][privilegeName] = checked;
    });
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