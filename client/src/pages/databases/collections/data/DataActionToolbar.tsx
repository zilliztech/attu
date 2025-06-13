import { useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { rootContext } from '@/context';
import { DataService } from '@/http';
import { ToolBarConfig } from '@/components/grid/Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import InsertDialog from '@/pages/dialogs/insert/Dialog';
import EditJSONDialog from '@/pages/dialogs/EditJSONDialog';
import EmptyDataDialog from '@/pages/dialogs/EmptyDataDialog';
import ImportSampleDialog from '@/pages/dialogs/ImportSampleDialog';
import DataListView from '@/components/DataListView/DataListView';
import { saveCsvAs } from '@/utils';
import { DataTypeStringEnum, ConsistencyLevelEnum } from '@/consts';
import type { QueryState } from '../../types';
import { CollectionFullObject } from '@server/types';

interface DataActionToolbarProps {
  collection: CollectionFullObject;
  selectedData: any[];
  total: number;
  queryState: QueryState;
  setQueryState: (state: QueryState) => void;
  onDelete: () => Promise<void>;
  onInsert: (collectionName: string) => Promise<void>;
  getEditData: (data: any, collection: CollectionFullObject) => any;
  setSelectedData: (data: any[]) => void;
}

const DataActionToolbar = (props: DataActionToolbarProps) => {
  const {
    collection,
    selectedData,
    total,
    queryState,
    setQueryState,
    onDelete,
    onInsert,
    getEditData,
    setSelectedData,
  } = props;

  // UI functions
  const { setDialog, handleCloseDialog, openSnackBar, setDrawer } =
    useContext(rootContext);

  // translations
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: searchTrans } = useTranslation('search');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const handleEditConfirm = useCallback(
    async (data: Record<string, any>) => {
      const result = (await DataService.upsert(collection.collection_name, {
        fields_data: [data],
      })) as any;

      const idField = result.IDs.id_field;
      const id = result.IDs[idField].data;
      // deselect all
      setSelectedData([]);
      const newExpr = `${collection.schema.primaryField.name} == ${id}`;
      // set expr with id
      setQueryState({
        ...queryState,
        consistencyLevel: ConsistencyLevelEnum.Strong,
        expr: newExpr,
        tick: queryState.tick + 1,
      });
    },
    [
      collection.collection_name,
      collection.schema.primaryField.name,
      queryState,
      setQueryState,
      setSelectedData,
    ]
  );

  // Memoize toolbar configs
  return useMemo<ToolBarConfig[]>(
    () => [
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
            content: (
              <DataListView collection={collection} data={selectedData} />
            ),
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
                    await DataService.deleteEntities(
                      collection.collection_name,
                      {
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
                      }
                    );
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
    ],
    [
      collection,
      selectedData,
      total,
      queryState,
      setQueryState,
      setDialog,
      setDrawer,
      handleCloseDialog,
      openSnackBar,
      onInsert,
      onDelete,
      getEditData,
      setSelectedData,
      btnTrans,
      dialogTrans,
      successTrans,
      searchTrans,
      collectionTrans,
    ]
  );
};

export default DataActionToolbar;
