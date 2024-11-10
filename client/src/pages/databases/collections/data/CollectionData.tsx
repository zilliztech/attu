import { useState, useEffect, useRef, useContext } from 'react';
import { Typography } from '@mui/material';
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
import EditEntityDialog from '@/pages/dialogs/EditEntityDialog';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { getQueryStyles } from './Styles';
import {
  DYNAMIC_FIELD,
  DataTypeStringEnum,
  CONSISTENCY_LEVEL_OPTIONS,
  ConsistencyLevelEnum,
} from '@/consts';
import CustomSelector from '@/components/customSelector/CustomSelector';
import EmptyDataDialog from '@/pages/dialogs/EmptyDataDialog';
import ImportSampleDialog from '@/pages/dialogs/ImportSampleDialog';
import { detectItemType } from '@/utils';
import { CollectionObject, CollectionFullObject } from '@server/types';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import CustomInput from '@/components/customInput/CustomInput';
import CustomMultiSelector from '@/components/customSelector/CustomMultiSelector';
import CollectionColHeader from '../CollectionColHeader';
import MediaPreview from '@/components/MediaPreview/MediaPreview';

export interface CollectionDataProps {
  collectionName: string;
  collections: CollectionObject[];
}

const CollectionData = (props: CollectionDataProps) => {
  // props
  const { collections } = props;
  const collection = collections.find(
    i => i.collection_name === props.collectionName
  ) as CollectionFullObject;

  // collection is not found or collection full object is not ready
  if (!collection || !collection.consistency_level) {
    return <StatusIcon type={LoadingType.CREATING} />;
  }

  // UI state
  const [tableLoading, setTableLoading] = useState<boolean>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [expression, setExpression] = useState<string>('');
  const [consistencyLevel, setConsistencyLevel] = useState<string>(
    collection.consistency_level
  );

  // collection fields, combine static and dynamic fields
  const fields = [
    ...collection.schema.fields,
    ...collection.schema.dynamicFields,
  ];

  // UI functions
  const { setDialog, handleCloseDialog, openSnackBar } =
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
  const gridTrans = commonTrans('grid');
  // classes
  const classes = getQueryStyles();

  // UI ref
  const filterRef = useRef();
  const inputRef = useRef<HTMLInputElement>();

  // UI event handlers
  const handleFilterReset = async () => {
    // reset advanced filter
    const currentFilter: any = filterRef.current;
    currentFilter?.getReset();
    // update UI expression
    setExpression('');
    // reset query
    reset();
    // ensure not loading
    setTableLoading(false);
  };
  const handleFilterSubmit = async (expression: string) => {
    // update UI expression
    setExpression(expression);
    // update expression
    setExpr(expression);
  };
  const handlePageChange = async (e: any, page: number) => {
    // do the query
    await query(page, consistencyLevel);
    // update page number
    setCurrentPage(page);
  };
  const onSelectChange = (value: any) => {
    setSelectedData(value);
  };
  const onDelete = async () => {
    // reset query
    reset();
    count(ConsistencyLevelEnum.Strong);
    await query(0, ConsistencyLevelEnum.Strong);
  };
  const handleDelete = async () => {
    // call delete api
    await DataService.deleteEntities(collection.collection_name, {
      expr: `${collection!.schema.primaryField.name} in [${selectedData
        .map(v =>
          collection!.schema.primaryField.data_type ===
          DataTypeStringEnum.VarChar
            ? `"${v[collection!.schema.primaryField.name]}"`
            : v[collection!.schema.primaryField.name]
        )
        .join(',')}]`,
    });
    handleCloseDialog();
    openSnackBar(successTrans('delete', { name: collectionTrans('entities') }));
    setSelectedData([]);
    await onDelete();
  };

  // Query hook
  const {
    currentPage,
    total,
    pageSize,
    expr,
    queryResult,
    setPageSize,
    setCurrentPage,
    setExpr,
    query,
    reset,
    count,
    outputFields,
    setOutputFields,
  } = useQuery({
    collection,
    consistencyLevel,
    fields,
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
  });

  const onInsert = async (collectionName: string) => {
    await fetchCollection(collectionName);
  };

  const onEditEntity = async () => {
    await query(currentPage, ConsistencyLevelEnum.Strong);
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
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <EditEntityDialog
                data={selectedData[0]}
                collection={collection!}
                cb={onEditEntity}
              />
            ),
          },
        });
      },
      label: btnTrans('edit'),
      icon: 'edit',
      tooltip: btnTrans('editEntityTooltip'),
      disabledTooltip: btnTrans(
        collection.autoID
          ? 'editEntityDisabledTooltipAutoId'
          : 'editEntityDisabledTooltip'
      ),
      disabled: () => collection.autoID || selectedData?.length !== 1,
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
                label={btnTrans('drop')}
                title={dialogTrans('deleteTitle', {
                  type: collectionTrans('entities'),
                })}
                text={collectionTrans('deleteDataWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: btnTrans('delete'),
      icon: 'delete',
      tooltip: btnTrans('deleteTooltip'),
      disabledTooltip: collectionTrans('deleteDisabledTooltip'),
      disabled: () => selectedData.length === 0,
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
  }, [collection.collection_name]);

  return (
    <div className={classes.root}>
      {collection && (
        <>
          <CustomToolBar toolbarConfigs={toolbarConfigs} hideOnDisable={true} />
          <div className={classes.toolbar}>
            <div className="left">
              <CustomInput
                type="text"
                textConfig={{
                  label: expression
                    ? collectionTrans('queryExpression')
                    : collectionTrans('exprPlaceHolder'),
                  key: 'advFilter',
                  className: 'textarea',
                  onChange: (value: string) => {
                    setExpression(value);
                  },
                  value: expression,
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
                      // reset page
                      setCurrentPage(0);
                      if (expr !== expression) {
                        setExpr(expression);
                      } else {
                        // ensure query
                        query();
                      }
                      e.preventDefault();
                    }
                  },
                }}
                checkValid={() => true}
              />

              <CustomSelector
                options={CONSISTENCY_LEVEL_OPTIONS}
                value={consistencyLevel}
                label={collectionTrans('consistency')}
                wrapperClass={classes.selector}
                disabled={!collection.loaded}
                variant="filled"
                onChange={(e: { target: { value: unknown } }) => {
                  const consistency = e.target.value as string;
                  setConsistencyLevel(consistency);
                }}
              />
            </div>

            <div className="right">
              <CustomMultiSelector
                className={classes.outputs}
                options={fields.map(f => {
                  return {
                    label:
                      f.name === DYNAMIC_FIELD
                        ? searchTrans('dynamicFields')
                        : f.name,
                    value: f.name,
                  };
                })}
                values={outputFields}
                renderValue={selected => (
                  <span>{`${(selected as string[]).length} ${
                    gridTrans[
                      (selected as string[]).length > 1 ? 'fields' : 'field'
                    ]
                  }`}</span>
                )}
                label={searchTrans('outputFields')}
                wrapperClass="selector"
                variant="filled"
                onChange={(e: { target: { value: unknown } }) => {
                  // add value to output fields if not exist, remove if exist
                  const newOutputFields = [...outputFields];
                  const values = e.target.value as string[];
                  const newFields = values.filter(
                    v => !newOutputFields.includes(v as string)
                  );
                  const removeFields = newOutputFields.filter(
                    v => !values.includes(v as string)
                  );
                  newOutputFields.push(...newFields);
                  removeFields.forEach(f => {
                    const index = newOutputFields.indexOf(f);
                    newOutputFields.splice(index, 1);
                  });

                  // sort output fields by schema order
                  newOutputFields.sort(
                    (a, b) =>
                      fields.findIndex(f => f.name === a) -
                      fields.findIndex(f => f.name === b)
                  );

                  setOutputFields(newOutputFields);
                }}
              />
              <CustomButton
                className={classes.btn}
                onClick={handleFilterReset}
                disabled={!collection.loaded}
                startIcon={<ResetIcon classes={{ root: 'icon' }} />}
              >
                {btnTrans('reset')}
              </CustomButton>
              <CustomButton
                className={classes.btn}
                variant="contained"
                onClick={() => {
                  setCurrentPage(0);
                  if (expr !== expression) {
                    setExpr(expression);
                  } else {
                    // ensure query
                    query();
                  }
                }}
                disabled={!collection.loaded}
              >
                {btnTrans('query')}
              </CustomButton>
            </div>
          </div>
          <AttuGrid
            toolbarConfigs={[]}
            colDefinitions={outputFields.map(i => {
              return {
                id: i,
                align: 'left',
                disablePadding: false,
                needCopy: true,
                formatter(_: any, cellData: any) {
                  const itemType = detectItemType(cellData);
                  switch (itemType) {
                    case 'json':
                    case 'array':
                    case 'bool':
                      const res = JSON.stringify(cellData);
                      return <Typography title={res}>{res}</Typography>;
                    case 'string':
                      return <MediaPreview value={cellData} />;
                    default:
                      return cellData;
                  }
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
            rowHeight={43}
            selected={selectedData}
            setSelected={onSelectChange}
            page={currentPage}
            onPageChange={handlePageChange}
            setRowsPerPage={setPageSize}
            rowsPerPage={pageSize}
            labelDisplayedRows={getLabelDisplayedRows(
              gridTrans[queryResult.data.length > 1 ? 'entities' : 'entity'],
              `(${queryResult.latency || ''} ms)`
            )}
            noData={searchTrans(
              `${collection.loaded ? 'empty' : 'collectionNotLoaded'}`
            )}
          />
        </>
      )}
    </div>
  );
};

export default CollectionData;
