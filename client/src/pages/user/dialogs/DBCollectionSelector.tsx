import { useState, useCallback, useEffect, useContext } from 'react';
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Radio,
} from '@mui/material';
import { authContext } from '@/context';
import Autocomplete from '@mui/material/Autocomplete';
import { CollectionService } from '@/http';
import { useTranslation } from 'react-i18next';
import { useDBCollectionSelectorStyle } from './styles';
import type {
  DBOption,
  CollectionOption,
  DBCollectionsSelectorProps,
} from '../Types';
import type { DBCollectionsPrivileges, RBACOptions } from '@server/types';

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
  // context
  const { isDedicated } = useContext(authContext);

  // UI states
  const [selectedDB, setSelectedDB] = useState<DBOption | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('*');
  const [collectionOptions, setCollectionOptions] = useState<
    CollectionOption[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0); // Tab index
  const [privilegeOptionType, setPrivilegeOptionType] = useState<
    'group' | 'custom'
  >('group'); // Type of privilege options

  // Fetch collections when selected DB changes
  const fetchCollections = useCallback(async (dbName: string) => {
    // const
    const ALL_COLLECTIONS = { name: '*', value: '*' };
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
    category: keyof RBACOptions,
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
    category: keyof RBACOptions,
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
    category: keyof RBACOptions,
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
  const getSelectedPrivilegesCount = (
    collectionValue: string,
    privileges: [string, Record<string, string>][]
  ): number => {
    const selectedDBValue = selectedDB?.value;
    if (!selectedDBValue) return 0;

    const collectionPrivileges =
      selected[selectedDBValue]?.collections?.[collectionValue] || {};

    // Count the number of privileges that are selected for the collection
    const selectedCount = privileges.reduce(
      (total, [_, categoryPrivileges]) => {
        return (
          total +
          Object.keys(categoryPrivileges).reduce((total, privilegeName) => {
            return total + (collectionPrivileges[privilegeName] ? 1 : 0);
          }, 0)
        );
      },
      0
    );

    return selectedCount;
  };

  // Calculate the total number of privileges for a collection
  const getTotalPrivilegesCount = (
    privileges: [string, Record<string, string>][]
  ) => {
    const total = privileges.reduce((total, [_, categoryPrivileges]) => {
      return total + Object.keys(categoryPrivileges).length;
    }, 0);

    return total;
  };

  // extract privileges options
  const globalPrivileges = [
    'DatabasePrivileges',
    'ResourceManagementPrivileges',
    'RBACPrivileges',
  ];

  const rbacEntries = Object.entries(rbacOptions) as [
    keyof RBACOptions,
    Record<string, string>
  ][];
  const databasePrivilegeOptions = rbacEntries.filter(([category]) => {
    return (
      category === 'DatabasePrivileges' || category == 'DatabasePrivilegeGroups'
    );
  });
  const collectionPrivilegeOptions = rbacEntries.filter(([category]) => {
    return (
      !globalPrivileges.includes(category) &&
      category !== 'ClusterPrivilegeGroups' &&
      category !== 'DatabasePrivilegeGroups'
    );
  });
  const clusterPrivileges = rbacEntries.filter(([category]) => {
    return (
      category === 'ResourceManagementPrivileges' ||
      category === 'RBACPrivileges' ||
      category === 'ClusterPrivilegeGroups' ||
      category === 'CustomPrivilegeGroups'
    );
  });

  const collectionTypeOptions = collectionPrivilegeOptions.filter(c => {
    return privilegeOptionType === 'group'
      ? c[0].includes('Groups')
      : !c[0].includes('Groups');
  });

  return (
    <div className={classes.root}>
      {/* Privilege type toggle */}
      <div className={classes.toggle}>
        <label className="toggle-label">
          <Radio
            checked={privilegeOptionType === 'group'}
            onChange={() => setPrivilegeOptionType('group')}
            value="group"
            name="group"
            size="small"
            inputProps={{ 'aria-label': 'group' }}
          />
          {userTrans('privilegeGroups')}
        </label>
        {!isDedicated && (
          <label className="toggle-label">
            <Radio
              checked={privilegeOptionType === 'custom'}
              onChange={() => setPrivilegeOptionType('custom')}
              value="custom"
              name="custom"
              size="small"
              inputProps={{ 'aria-label': 'custom' }}
            />
            {userTrans('privileges')}
          </label>
        )}
      </div>
      {/* Tabs for cluster, Database, Collection */}
      <Tabs
        value={tabValue}
        onChange={(event, newValue) => setTabValue(newValue)}
        aria-label="tabs"
      >
        <Tab label={userTrans('collection')} sx={{ textTransform: 'none' }} />
        <Tab label={userTrans('database')} sx={{ textTransform: 'none' }} />
        <Tab label={userTrans('cluster')} sx={{ textTransform: 'none' }} />
      </Tabs>

      {tabValue === 2 && (
        <PrivilegeSelector
          privilegeOptions={clusterPrivileges}
          selected={selected}
          selectedDB={{ name: userTrans('allDatabases'), value: '*' }}
          selectedCollection={'*'}
          handlePrivilegeChange={handlePrivilegeChange}
          isCategoryAllSelected={isCategoryAllSelected}
          isCategorySomeSelected={isCategorySomeSelected}
          handleSelectAll={handleSelectAll}
          privilegeOptionType={privilegeOptionType}
        />
      )}

      {tabValue === 1 && (
        <div>
          <Autocomplete
            className={classes.selectorDB}
            options={dbOptions}
            loading={loading}
            value={selectedDB || null}
            onChange={(_, value) => {
              if (!value) return;
              handleDBChange(value);
            }}
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
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
          <PrivilegeSelector
            privilegeOptions={databasePrivilegeOptions}
            selected={selected}
            selectedDB={selectedDB}
            selectedCollection={'*'}
            handlePrivilegeChange={handlePrivilegeChange}
            isCategoryAllSelected={isCategoryAllSelected}
            isCategorySomeSelected={isCategorySomeSelected}
            handleSelectAll={handleSelectAll}
            privilegeOptionType={privilegeOptionType}
          />
        </div>
      )}

      {tabValue === 0 && (
        <div>
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
              getOptionLabel={option => option.name}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
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
              getOptionLabel={option => {
                const selectedCount = getSelectedPrivilegesCount(
                  option.value,
                  collectionTypeOptions
                );
                const totalCount = getTotalPrivilegesCount(
                  collectionTypeOptions
                );
                return `${option.name} (${selectedCount}/${totalCount})`;
              }}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
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

          <PrivilegeSelector
            privilegeOptions={collectionPrivilegeOptions}
            selected={selected}
            selectedDB={selectedDB}
            selectedCollection={selectedCollection}
            handlePrivilegeChange={handlePrivilegeChange}
            isCategoryAllSelected={isCategoryAllSelected}
            isCategorySomeSelected={isCategorySomeSelected}
            handleSelectAll={handleSelectAll}
            privilegeOptionType={privilegeOptionType}
          />
        </div>
      )}
    </div>
  );
}

// PriviligeSelector
const PrivilegeSelector = (props: {
  privilegeOptions: [keyof RBACOptions, Record<string, string>][];
  selected: DBCollectionsPrivileges;
  selectedDB: DBOption | null;
  selectedCollection: string;
  privilegeOptionType: 'group' | 'custom';
  handlePrivilegeChange: (
    collectionValue: string,
    privilegeName: string,
    checked: boolean,
    dbValue: string
  ) => void;
  isCategoryAllSelected: (
    category: keyof RBACOptions,
    collectionValue: string,
    dbValue: string
  ) => boolean;
  isCategorySomeSelected: (
    category: keyof RBACOptions,
    collectionValue: string,
    dbValue: string
  ) => boolean;
  handleSelectAll: (
    category: keyof RBACOptions,
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
    privilegeOptionType,
  } = props;

  // style
  const classes = useDBCollectionSelectorStyle();

  // i18n
  const { t: userTrans } = useTranslation('user');

  return (
    <div className={classes.privileges}>
      {selectedDB && selectedCollection && (
        <div>
          {privilegeOptions
            .filter(v => {
              if (privilegeOptionType === 'group') {
                return v[0].includes('Groups') && Object.keys(v[1]).length > 0;
              } else {
                return !v[0].includes('Groups');
              }
            })
            .map(([category, categoryPrivileges]) => (
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
                    label={userTrans(category)}
                  />
                </div>
                <div className={classes.categoryBody}>
                  {Object.entries(categoryPrivileges).map(([privilegeName]) => (
                    <FormControlLabel
                      className={classes.privilegeBody}
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
