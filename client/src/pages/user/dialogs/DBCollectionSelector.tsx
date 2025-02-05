import { useState, useCallback, useEffect } from 'react';
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
  DBCollectionsSelectorProps,
} from '../Types';
import type { DBCollectionsPrivileges } from '@server/types/users.type';

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
  const [collectionOptions, setCollectionOptions] = useState<
    CollectionOption[]
  >([]);
  const [loading, setLoading] = useState(false);

  // const
  const ALL_COLLECTIONS = { name: userTrans('allCollections'), value: '*' };

  // Fetch collections when selected DB changes
  const fetchCollections = useCallback(async (dbName: string) => {
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
      setCollectionOptions(options);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize selectedDB and fetch collections when dbOptions changes
  useEffect(() => {
    if (dbOptions.length > 0 && selectedDB === null) {
      const initialDB = dbOptions[0];
      setSelectedDB(initialDB);
      fetchCollections(initialDB.value);
    }
  }, [dbOptions, selectedDB, fetchCollections]);

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
    checked: boolean,
    dbValue: string
  ) => {
    const selectedDBValue = dbValue;
    if (!selectedDBValue) return;

    const newSelected = { ...selected };
    if (!newSelected[selectedDBValue]) {
      newSelected[selectedDBValue] = { collections: {} };
    }
    if (!newSelected[selectedDBValue].collections[collectionValue]) {
      newSelected[selectedDBValue].collections[collectionValue] = {};
    }
    newSelected[selectedDBValue].collections[collectionValue][privilegeName] =
      checked;
    setSelected(newSelected);
  };

  // Handle select all privileges in a category
  const handleSelectAll = (
    category: string,
    collectionValue: string,
    checked: boolean,
    dbValue: string
  ) => {
    const selectedDBValue = dbValue;
    if (!selectedDBValue) return;

    const newSelected = { ...selected };
    if (!newSelected[selectedDBValue]) {
      newSelected[selectedDBValue] = { collections: {} };
    }
    if (!newSelected[selectedDBValue].collections[collectionValue]) {
      newSelected[selectedDBValue].collections[collectionValue] = {};
    }
    Object.keys(rbacOptions[category]).forEach(privilegeName => {
      newSelected[selectedDBValue].collections[collectionValue][privilegeName] =
        checked;
    });
    setSelected(newSelected);
  };

  // Check if all privileges in a category are selected
  const isCategoryAllSelected = (
    category: string,
    collectionValue: string,
    dbValue: string
  ) => {
    const selectedDBValue = dbValue || selectedDB?.value;
    if (!selectedDBValue) return false;

    const categoryPrivileges = rbacOptions[category];
    return Object.keys(categoryPrivileges).every(
      privilegeName =>
        selected[selectedDBValue] &&
        selected[selectedDBValue].collections &&
        selected[selectedDBValue].collections[collectionValue]?.[privilegeName]
    );
  };

  // Check if some privileges in a category are selected
  const isCategorySomeSelected = (
    category: string,
    collectionValue: string,
    dbValue: string
  ) => {
    const selectedDBValue = dbValue;
    if (!selectedDBValue) return false;

    const categoryPrivileges = rbacOptions[category];
    const someSelected = Object.keys(categoryPrivileges).some(
      privilegeName =>
        selected[selectedDBValue] &&
        selected[selectedDBValue].collections &&
        selected[selectedDBValue].collections[collectionValue]?.[privilegeName]
    );
    const allSelected = isCategoryAllSelected(
      category,
      collectionValue,
      dbValue
    );
    return someSelected && !allSelected;
  };

  // Calculate the number of selected privileges for a collection
  const getSelectedPrivilegesCount = (collectionValue: string) => {
    const selectedDBValue = selectedDB?.value;
    if (!selectedDBValue) return 0;

    const collectionPrivileges =
      selected[selectedDBValue]?.collections?.[collectionValue] || {};
    return Object.values(collectionPrivileges).filter(Boolean).length;
  };

  // Calculate the total number of privileges for a collection
  const getTotalPrivilegesCount = () => {
    return Object.values(rbacOptions).reduce(
      (total, category) => total + Object.keys(category).length,
      0
    );
  };

  const globalPrivileges = [
    'DatabasePrivileges',
    'ResourceManagementPrivileges',
    'RBACPrivileges',
  ];

  const databasePrivilegeOptions = Object.entries(rbacOptions).filter(
    ([category]) => {
      return category === 'DatabasePrivileges';
    }
  );

  const collectionPrivilegeOptions = Object.entries(rbacOptions).filter(
    ([category]) => {
      return !globalPrivileges.includes(category);
    }
  );

  const clusterPrivileges = Object.entries(rbacOptions).filter(([category]) => {
    return (
      category === 'ResourceManagementPrivileges' ||
      category === 'RBACPrivileges'
    );
  });

  return (
    <div className={classes.root}>
      <h3>Cluster Privileges</h3>
      <PrivilegeSelector
        privilegeOptions={clusterPrivileges}
        selected={selected}
        selectedDB={{ name: userTrans('allDatabases'), value: '*' }}
        selectedCollection={'*'}
        handlePrivilegeChange={handlePrivilegeChange}
        isCategoryAllSelected={isCategoryAllSelected}
        isCategorySomeSelected={isCategorySomeSelected}
        handleSelectAll={handleSelectAll}
      />

      <h3>Database Privileges</h3>
      <PrivilegeSelector
        privilegeOptions={databasePrivilegeOptions}
        selected={selected}
        selectedDB={{ name: userTrans('allDatabases'), value: '*' }}
        selectedCollection={'*'}
        handlePrivilegeChange={handlePrivilegeChange}
        isCategoryAllSelected={isCategoryAllSelected}
        isCategorySomeSelected={isCategorySomeSelected}
        handleSelectAll={handleSelectAll}
      />

      <h3>Data Privileges</h3>

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
          getOptionLabel={option => option.name} // Only display the DB name
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={params => (
            <TextField
              {...params}
              label={userTrans('databases')} // Only display the label
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
          getOptionLabel={option => {
            const selectedCount = getSelectedPrivilegesCount(option.value);
            const totalCount = getTotalPrivilegesCount();
            return `${option.name} (${selectedCount}/${totalCount})`;
          }}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={params => {
            const selectedCount =
              getSelectedPrivilegesCount(selectedCollection);
            const totalCount = getTotalPrivilegesCount();
            return (
              <TextField
                {...params}
                label={`${userTrans(
                  'collections'
                )} (${selectedCount}/${totalCount})`}
                variant="filled"
              />
            );
          }}
          noOptionsText={
            loading ? searchTrans('loading') : searchTrans('noOptions')
          }
        />
      </div>

      <PrivilegeSelector
        privilegeOptions={collectionPrivilegeOptions}
        selected={selected}
        selectedDB={selectedDB}
        selectedCollection={selectedCollection}
        handlePrivilegeChange={handlePrivilegeChange}
        isCategoryAllSelected={isCategoryAllSelected}
        isCategorySomeSelected={isCategorySomeSelected}
        handleSelectAll={handleSelectAll}
      />
    </div>
  );
}

// PriviligeSelector
const PrivilegeSelector = (props: {
  privilegeOptions: [string, Record<string, unknown>][];
  selected: DBCollectionsPrivileges;
  selectedDB: DBOption | null;
  selectedCollection: string;
  handlePrivilegeChange: (
    collectionValue: string,
    privilegeName: string,
    checked: boolean,
    dbValue: string
  ) => void;
  isCategoryAllSelected: (
    category: string,
    collectionValue: string,
    dbValue: string
  ) => boolean;
  isCategorySomeSelected: (
    category: string,
    collectionValue: string,
    dbValue: string
  ) => boolean;
  handleSelectAll: (
    category: string,
    collectionValue: string,
    checked: boolean,
    dbValue: string
  ) => void;
}) => {
  // props
  const {
    selected,
    selectedDB,
    selectedCollection,
    privilegeOptions,
    handlePrivilegeChange,
    handleSelectAll,
    isCategoryAllSelected,
    isCategorySomeSelected,
  } = props;

  // style
  const classes = useDBCollectionSelectorStyle();

  // i18n
  const { t: userTrans } = useTranslation('user');

  return (
    <div className={classes.privileges}>
      {selectedDB && selectedCollection && (
        <div>
          {privilegeOptions.map(([category, categoryPrivileges]) => (
            <div key={category}>
              <div className={classes.categoryHeader}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCategoryAllSelected(
                        category,
                        selectedCollection,
                        selectedDB.value
                      )}
                      indeterminate={isCategorySomeSelected(
                        category,
                        selectedCollection,
                        selectedDB.value
                      )}
                      onChange={e =>
                        handleSelectAll(
                          category,
                          selectedCollection,
                          e.target.checked,
                          selectedDB.value
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
                {Object.entries(categoryPrivileges).map(([privilegeName]) => (
                  <FormControlLabel
                    key={privilegeName}
                    control={
                      <Checkbox
                        className={classes.checkbox}
                        checked={
                          (selected[selectedDB.value] &&
                            selected[selectedDB.value].collections &&
                            selected[selectedDB.value].collections[
                              selectedCollection
                            ]?.[privilegeName]) ||
                          false
                        }
                        size="small"
                        onChange={e =>
                          handlePrivilegeChange(
                            selectedCollection,
                            privilegeName,
                            e.target.checked,
                            selectedDB.value
                          )
                        }
                      />
                    }
                    label={privilegeName}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
