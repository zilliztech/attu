import { useState, useEffect, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext, dataContext } from '@/context';
import { DataService } from '@/http';
import { useQuery } from '@/hooks';
import { saveCsvAs, getColumnWidth } from '@/utils';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import AttuGrid from '@/components/grid/Grid';
import { ToolBarConfig } from '@/components/grid/Types';
import Filter from '@/components/advancedSearch';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import CustomToolBar from '@/components/grid/ToolBar';
import InsertDialog from '@/pages/dialogs/insert/Dialog';
import EditJSONDialog from '@/pages/dialogs/EditJSONDialog';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { Root, Toolbar } from '../../StyledComponents';
import {
  DYNAMIC_FIELD,
  DataTypeStringEnum,
  CONSISTENCY_LEVEL_OPTIONS,
  ConsistencyLevelEnum,
} from '@/consts';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EmptyDataDialog from '@/pages/dialogs/EmptyDataDialog';
import ImportSampleDialog from '@/pages/dialogs/ImportSampleDialog';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import CustomInput from '@/components/customInput/CustomInput';
import CollectionColHeader from '../CollectionColHeader';
import DataView from '@/components/DataView/DataView';
import DataListView from '@/components/DataListView/DataListView';
import type { QueryState } from '../../types';
import { CollectionFullObject } from '@server/types';
import CustomMultiSelector from '../../../../components/customSelector/CustomMultiSelector';

export interface CollectionDataProps {
  queryState: QueryState;
  setQueryState: (state: QueryState) => void;
}

const CollectionData = (props: CollectionDataProps) => {
  // props
  const { queryState, setQueryState } = props;
  const collection = queryState && queryState.collection;

  // collection is not found or collection full object is not ready
  if (!collection || !collection.consistency_level) {
    return <StatusIcon type={LoadingType.CREATING} />;
  }

  // UI state
  const [tableLoading, setTableLoading] = useState<boolean>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [exprInput, setExprInput] = useState<string>(queryState.expr);

  // UI functions
  const { setDialog, handleCloseDialog, openSnackBar, setDrawer } =
    useContext(rootContext);
  const { fetchCollection } = useContext(dataContext);
  // icons
  const ResetIcon = icons.refresh;
  // translations
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();

  // UI ref
  const filterRef = useRef();
  const inputRef = useRef<HTMLInputElement>();

  // UI event handlers
  const handleFilterReset = async () => {
    // reset advanced filter
    const currentFilter: any = filterRef.current;
    currentFilter?.getReset();
    // update UI expression
    setExprInput('');
    setQueryState({
      ...queryState,
      expr: '',
      outputFields: [
        ...collection.schema.fields,
        ...collection.schema.dynamicFields,
      ].map(f => f.name),
      tick: queryState.tick + 1,
    });

    // ensure not loading
    setTableLoading(false);
  };
  const handleFilterSubmit = async (expression: string) => {
    // update UI expression
    setQueryState({ ...queryState, expr: expression });
    setExprInput(expression);
  };
  const handlePageChange = async (e: any, page: number) => {
    // do the query
    await query(page, queryState.consistencyLevel);
    // update page number
    setCurrentPage(page);
  };
  const onSelectChange = (value: any) => {
    setSelectedData(value);
  };
  const onDelete = async () => {
    // clear selection
    setSelectedData([]);
    // reset();
    reset();
    // update count
    count(ConsistencyLevelEnum.Strong);
    // update query
    query(0, ConsistencyLevelEnum.Strong);
  };

  // Query hook
  const {
    currentPage,
    total,
    pageSize,
    queryResult,
    setPageSize,
    setCurrentPage,
    query,
    reset,
    count,
  } = useQuery({
    collection,
    onQueryStart: (expr: string = '') => {
      setTableLoading(true);
      if (expr === '') {
        handleFilterReset();
        return;
      }
    },
    onQueryFinally: () => {
      setTableLoading(false);
    },
    queryState: queryState,
    setQueryState: setQueryState,
  });

  const onInsert = async (collectionName: string) => {
    await fetchCollection(collectionName);
  };

  const handleEditConfirm = async (data: Record<string, any>) => {
    const result = (await DataService.upsert(collection.collection_name, {
      fields_data: [data],
    })) as any;

    const idField = result.IDs.id_field;
    const id = result.IDs[idField].data;
    // deselect all
    setSelectedData([]);
    const newExpr = `${collection.schema.primaryField.name} == ${id}`;
    // update local expr
    setExprInput(newExpr);
    // set expr with id
    setQueryState({
      ...queryState,
      consistencyLevel: ConsistencyLevelEnum.Strong,
      expr: newExpr,
      tick: queryState.tick + 1,
    });
  };

  const getEditData = (data: any, collection: CollectionFullObject) => {
    // sort data by collection schema order
    const schema = collection.schema;
    let sortedData: { [key: string]: any } = {};
    schema.fields.forEach(field => {
      if (data[field.name] !== undefined) {
        sortedData[field.name] = data[field.name];
      }
    });

    // add dynamic fields if exist
    const isDynamicSchema = collection.schema.dynamicFields.length > 0;
    if (isDynamicSchema) {
      sortedData = { ...sortedData, ...data[DYNAMIC_FIELD] };
    }

    return sortedData;
  };

  // Toolbar settings
  const toolbarConfigs: ToolBarConfig[] = [
    {
      icon: 'uploadFile',
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      label: btnTrans('importFile'),
      tooltip: btnTrans('importFileTooltip'),
      disabled: () => selectedData?.length > 0,
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <InsertDialog
                defaultSelectedCollection={collection.collection_name}
                // user can't select partition on collection page, so default value is ''
                defaultSelectedPartition={''}
                collections={[collection!]}
                onInsert={onInsert}
              />
            ),
          },
        });
      },
    },
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <ImportSampleDialog
                collection={collection!}
                cb={async () => {
                  await onInsert(collection.collection_name);
                  await onDelete();
                }}
              />
            ),
          },
        });
      },
      tooltip: btnTrans('importSampleDataTooltip'),
      label: btnTrans('importSampleData'),
      icon: 'add',
      // tooltip: collectionTrans('deleteTooltip'),
      disabled: () => selectedData?.length > 0,
    },
    {
      icon: 'deleteOutline',
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <EmptyDataDialog
                cb={async () => {
                  await onDelete();
                }}
                collection={collection!}
              />
            ),
          },
        });
      },
      label: btnTrans('empty'),
      tooltip: btnTrans('emptyTooltip'),
      disabled: () => selectedData?.length > 0 || total == 0,
    },
    {
      icon: 'eye',
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDrawer({
          open: true,
          title: 'custom',
          content: <DataListView collection={collection} data={selectedData} />,
          hasActionBar: true,
          actions: [],
        });
      },
      label: btnTrans('viewData'),
      tooltip: btnTrans('viewDataTooltip'),
      disabled: () => selectedData?.length !== 1,
      hideOnDisable() {
        return selectedData?.length === 0;
      },
    },
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <EditJSONDialog
                data={getEditData(selectedData[0], collection)}
                dialogTitle={dialogTrans('editEntityTitle')}
                dialogTip={dialogTrans('editEntityInfo')}
                handleConfirm={handleEditConfirm}
                handleCloseDialog={handleCloseDialog}
              />
            ),
          },
        });
      },
      label: btnTrans('edit'),
      icon: 'edit',
      tooltip: btnTrans('editEntityTooltip'),
      disabledTooltip: btnTrans('editEntityDisabledTooltip'),
      disabled: () => selectedData?.length !== 1,
      hideOnDisable() {
        return selectedData?.length === 0;
      },
    },
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        saveCsvAs(selectedData, `${collection.collection_name}.query.csv`);
      },
      label: btnTrans('export'),
      icon: 'download',
      tooltip: btnTrans('exportTooltip'),
      disabledTooltip: btnTrans('downloadDisabledTooltip'),
      disabled: () => !selectedData?.length,
    },
    {
      type: 'button',
      btnVariant: 'text',
      onClick: async () => {
        let json = JSON.stringify(selectedData);
        try {
          await navigator.clipboard.writeText(json);
          alert(`${selectedData.length} rows copied to clipboard`);
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      },
      label: btnTrans('copyJson'),
      icon: 'copy',
      tooltip: btnTrans('copyJsonTooltip'),
      disabledTooltip: btnTrans('downloadDisabledTooltip'),
      disabled: () => !selectedData?.length,
    },

    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <DeleteTemplate
                label={btnTrans('delete')}
                title={dialogTrans('deleteEntityTitle')}
                text={collectionTrans('deleteDataWarning')}
                handleDelete={async () => {
                  // call delete api
                  await DataService.deleteEntities(collection.collection_name, {
                    expr: `${
                      collection!.schema.primaryField.name
                    } in [${selectedData
                      .map(v =>
                        collection!.schema.primaryField.data_type ===
                        DataTypeStringEnum.VarChar
                          ? `"${v[collection!.schema.primaryField.name]}"`
                          : v[collection!.schema.primaryField.name]
                      )
                      .join(',')}]`,
                  });
                  handleCloseDialog();
                  openSnackBar(
                    successTrans('delete', {
                      name: collectionTrans('entities'),
                    })
                  );
                  setSelectedData([]);
                  await onDelete();
                }}
              />
            ),
          },
        });
      },
      label: btnTrans('delete'),
      icon: 'cross2',
      tooltip: btnTrans('deleteTooltip'),
      disabledTooltip: collectionTrans('deleteDisabledTooltip'),
      disabled: () => !selectedData?.length,
    },
  ];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // reset selection
    setSelectedData([]);
    setExprInput(queryState.expr);
  }, [collection.collection_name]);

  return (
    <Root>
      {collection && (
        <>
          <CustomToolBar toolbarConfigs={toolbarConfigs} hideOnDisable={true} />
          <Toolbar>
            <div className="left">
              <CustomInput
                type="text"
                textConfig={{
                  label: exprInput
                    ? collectionTrans('queryExpression')
                    : collectionTrans('exprPlaceHolder'),
                  key: 'advFilter',
                  className: 'textarea',
                  onChange: (value: string) => {
                    setExprInput(value);
                  },
                  value: exprInput,
                  disabled: !collection.loaded,
                  variant: 'filled',
                  required: false,
                  InputLabelProps: { shrink: true },
                  InputProps: {
                    endAdornment: (
                      <Filter
                        title={''}
                        showTitle={false}
                        fields={collection.schema.scalarFields}
                        filterDisabled={!collection.loaded}
                        onSubmit={handleFilterSubmit}
                        showTooltip={false}
                      />
                    ),
                  },
                  onKeyDown: (e: any) => {
                    if (e.key === 'Enter') {
                      setQueryState({
                        ...queryState,
                        expr: exprInput,
                        tick: queryState.tick + 1,
                      });
                      // reset page
                      setCurrentPage(0);
                      e.preventDefault();
                    }
                  },
                }}
                checkValid={() => true}
              />

              <FormControl
                variant="filled"
                className="selector"
                disabled={!collection.loaded}
                sx={{ minWidth: 120 }}
              >
                <InputLabel>{collectionTrans('consistency')}</InputLabel>
                <Select
                  value={queryState.consistencyLevel}
                  label={collectionTrans('consistency')}
                  onChange={e => {
                    const consistency = e.target.value as string;
                    setQueryState({
                      ...queryState,
                      consistencyLevel: consistency,
                    });
                  }}
                >
                  {CONSISTENCY_LEVEL_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="right">
              <CustomMultiSelector
                options={queryState.fields.map(field => ({
                  label:
                    field.name === DYNAMIC_FIELD
                      ? searchTrans('dynamicFields')
                      : field.name,
                  value: field.name,
                }))}
                values={queryState.outputFields}
                label={searchTrans('outputFields')}
                variant="filled"
                wrapperClass="outputs selector"
                onChange={(e: { target: { value: unknown } }) => {
                  const values = e.target.value as string[];
                  // sort output fields by schema order
                  const newOutputFields = [...values].sort(
                    (a, b) =>
                      queryState.fields.findIndex(f => f.name === a) -
                      queryState.fields.findIndex(f => f.name === b)
                  );

                  setQueryState({
                    ...queryState,
                    outputFields: newOutputFields,
                  });
                }}
                renderValue={(selected: unknown) => {
                  const selectedArray = selected as string[];
                  return (
                    <span>{`${selectedArray.length} ${commonTrans(
                      selectedArray.length > 1 ? 'grid.fields' : 'grid.field'
                    )}`}</span>
                  );
                }}
                sx={{
                  '& .MuiSelect-select': {
                    fontSize: '14px',
                    minHeight: '28px',
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '14px',
                  },
                  '& .MuiMenuItem-root': {
                    padding: '2px 14px',
                    minHeight: '32px',
                    fontSize: '14px',
                  },
                  '& .MuiCheckbox-root': {
                    padding: '4px',
                  },
                  '& .MuiListItemText-root': {
                    margin: '0',
                  },
                }}
              />
              <CustomButton
                className="btn"
                onClick={handleFilterReset}
                disabled={!collection.loaded}
                startIcon={<ResetIcon classes={{ root: 'icon' }} />}
              >
                {btnTrans('reset')}
              </CustomButton>
              <CustomButton
                className="btn"
                variant="contained"
                onClick={() => {
                  setCurrentPage(0);
                  // set expr
                  setQueryState({
                    ...queryState,
                    expr: exprInput,
                    tick: queryState.tick + 1,
                  });
                }}
                disabled={!collection.loaded}
              >
                {btnTrans('query')}
              </CustomButton>
            </div>
          </Toolbar>
          <AttuGrid
            toolbarConfigs={[]}
            colDefinitions={queryState.outputFields.map(i => {
              return {
                id: i,
                align: 'left',
                disablePadding: false,
                needCopy: true,
                formatter(_: any, cellData: any) {
                  const field = collection.schema.fields.find(
                    f => f.name === i
                  );

                  const fieldType = field?.data_type || 'JSON'; // dynamic

                  return <DataView type={fieldType} value={cellData} />;
                },
                headerFormatter: v => {
                  return (
                    <CollectionColHeader def={v} collection={collection} />
                  );
                },
                getStyle: d => {
                  const field = collection.schema.fields.find(
                    f => f.name === i
                  );
                  if (!d || !field) {
                    return {};
                  }
                  return {
                    minWidth: getColumnWidth(field),
                  };
                },
                label: i === DYNAMIC_FIELD ? searchTrans('dynamicFields') : i,
              };
            })}
            primaryKey={collection.schema.primaryField.name}
            openCheckBox={true}
            isLoading={tableLoading}
            rows={queryResult.data}
            rowCount={total}
            tableHeaderHeight={46}
            rowHeight={41}
            selected={selectedData}
            setSelected={onSelectChange}
            page={currentPage}
            onPageChange={handlePageChange}
            setRowsPerPage={setPageSize}
            rowsPerPage={pageSize}
            labelDisplayedRows={getLabelDisplayedRows(
              commonTrans(
                queryResult.data.length > 1 ? 'grid.entities' : 'grid.entity'
              ),
              `(${queryResult.latency || ''} ms)`
            )}
            noData={searchTrans(
              `${collection.loaded ? 'empty' : 'collectionNotLoaded'}`
            )}
          />
        </>
      )}
    </Root>
  );
};

export default CollectionData;
