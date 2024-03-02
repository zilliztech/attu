import { useState, useEffect, useRef, useContext } from 'react';
import { TextField, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { rootContext } from '@/context';
import { DataService } from '@/http';
import { useQuery } from '@/hooks';
import { saveCsvAs } from '@/utils';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import AttuGrid from '@/components/grid/Grid';
import { ToolBarConfig } from '@/components/grid/Types';
import Filter from '@/components/advancedSearch';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import CustomToolBar from '@/components/grid/ToolBar';
import InsertDialog from '../dialogs/insert/Dialog';
import { getLabelDisplayedRows } from '../search/Utils';
import { getQueryStyles } from './Styles';
import {
  DYNAMIC_FIELD,
  DataTypeStringEnum,
  CONSISTENCY_LEVEL_OPTIONS,
  ConsistencyLevelEnum,
} from '@/consts';
import CustomSelector from '@/components/customSelector/CustomSelector';
import EmptyDataDialog from '../dialogs/EmptyDataDialog';
import ImportSampleDialog from '../dialogs/ImportSampleDialog';
import { detectItemType } from '@/utils';

const Query = () => {
  // get collection name from url
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  // UI state
  const [tableLoading, setTableLoading] = useState<boolean>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [expression, setExpression] = useState<string>('');
  // UI functions
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  // icons
  const ResetIcon = icons.refresh;
  // translations
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
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
    await query(page);
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
    await DataService.deleteEntities(collectionName, {
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
    collection,
    currentPage,
    total,
    pageSize,
    expr,
    queryResult,
    setPageSize,
    consistencyLevel,
    setConsistencyLevel,
    setCurrentPage,
    setExpr,
    query,
    reset,
    count,
  } = useQuery({
    collectionName,
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

  // Toolbar settings
  const toolbarConfigs: ToolBarConfig[] = [
    {
      icon: 'uploadFile',
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      label: btnTrans('importFile'),
      tooltip: btnTrans('importFileTooltip'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <InsertDialog
                defaultSelectedCollection={collectionName}
                // user can't select partition on collection page, so default value is ''
                defaultSelectedPartition={''}
                collections={[collection!]}
                onInsert={() => {}}
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
              <ImportSampleDialog collection={collectionName} cb={onDelete} />
            ),
          },
        });
      },
      tooltip: btnTrans('importSampleDataTooltip'),
      label: btnTrans('importSampleData'),
      icon: 'add',
      // tooltip: collectionTrans('deleteTooltip'),
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
                  openSnackBar(
                    successTrans('empty', {
                      name: collectionTrans('collection'),
                    })
                  );
                  await onDelete();
                }}
                collectionName={collectionName}
              />
            ),
          },
        });
      },
      disabled: () => total == 0,
      label: btnTrans('empty'),
      tooltip: btnTrans('emptyTooltip'),
    },
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        saveCsvAs(selectedData, `${collectionName}.query.csv`);
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

  return (
    <div className={classes.root}>
      {collection && (
        <>
          <CustomToolBar toolbarConfigs={toolbarConfigs} hideOnDisable={true} />
          <div className={classes.toolbar}>
            <div className="left">
              <TextField
                className="textarea"
                InputProps={{
                  classes: {
                    root: 'textfield',
                    multiline: 'multiline',
                  },
                }}
                value={expression}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                  setExpression(e.target.value as string);
                }}
                disabled={!collection!.loaded}
                InputLabelProps={{ shrink: true }}
                label={collectionTrans('exprPlaceHolder')}
                onKeyDown={e => {
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
                }}
                inputRef={inputRef}
              />
              <Filter
                ref={filterRef}
                title="Advanced Filter"
                fields={collection.schema.fields.filter(
                  i =>
                    i.data_type !== DataTypeStringEnum.FloatVector &&
                    i.data_type !== DataTypeStringEnum.BinaryVector
                )}
                filterDisabled={!collection.loaded}
                onSubmit={handleFilterSubmit}
                showTitle={false}
                showTooltip={false}
              />
              {/* </div> */}
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
              <CustomButton
                className="btn"
                onClick={handleFilterReset}
                disabled={!collection.loaded}
              >
                <ResetIcon classes={{ root: 'icon' }} />
                {btnTrans('reset')}
              </CustomButton>
              <CustomButton
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
            colDefinitions={collection.schema.fields.map((i: any) => {
              return {
                id: i.name,
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
                    default:
                      return cellData;
                  }
                },
                label:
                  i.name === DYNAMIC_FIELD
                    ? searchTrans('dynamicFields')
                    : i.name,
              };
            })}
            primaryKey={collection.schema.primaryField.name}
            openCheckBox={true}
            isLoading={!!tableLoading}
            rows={queryResult.data}
            rowCount={total}
            rowHeight={43}
            selected={selectedData}
            setSelected={onSelectChange}
            page={currentPage}
            onPageChange={handlePageChange}
            setRowsPerPage={setPageSize}
            rowsPerPage={pageSize}
            labelDisplayedRows={getLabelDisplayedRows(
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

export default Query;
