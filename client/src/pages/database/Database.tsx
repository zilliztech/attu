import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatabaseHttp } from '@/http/Database';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import {
  CreateDatabaseParams,
  DropDatabaseParams,
  DatabaseData,
} from './Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { rootContext } from '@/context';
import { useNavigationHook } from '@/hooks/Navigation';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import CreateUser from './Create';

const Database = () => {
  useNavigationHook(ALL_ROUTER_TYPES.DATABASES);

  const [databases, setDatabases] = useState<DatabaseData[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseData[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchDatabases = async () => {
    const res = await DatabaseHttp.getDatabases();
    setDatabases(res.db_names.map((v: string) => ({ name: v })));
  };

  const handleCreate = async (data: CreateDatabaseParams) => {
    await DatabaseHttp.createDatabase(data);
    fetchDatabases();
    openSnackBar(successTrans('create', { name: dbTrans('database') }));
    handleCloseDialog();
  };

  const handleDelete = async () => {
    for (const db of selectedDatabase) {
      const param: DropDatabaseParams = {
        db_name: db.name,
      };
      await DatabaseHttp.dropDatabase(param);
    }

    openSnackBar(successTrans('delete', { name: dbTrans('database') }));
    fetchDatabases();
    handleCloseDialog();
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: dbTrans('database'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <CreateUser
                handleCreate={handleCreate}
                handleClose={handleCloseDialog}
              />
            ),
          },
        });
      },
      icon: 'add',
    },

    {
      type: 'iconBtn',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <DeleteTemplate
                label={btnTrans('drop')}
                title={dialogTrans('deleteTitle', {
                  type: dbTrans('database'),
                })}
                text={dbTrans('deleteWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: '',
      disabled: () =>
        selectedDatabase.length === 0 ||
        selectedDatabase.findIndex(v => v.name === 'root') > -1,
      disabledTooltip: dbTrans('deleteTip'),

      icon: 'delete',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'name',
      align: 'left',
      disablePadding: false,
      label: 'Name',
    },
  ];

  const handleSelectChange = (value: DatabaseData[]) => {
    setSelectedDatabase(value);
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  return (
    <div className="page-wrapper">
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={databases}
        rowCount={databases.length}
        primaryKey="name"
        showPagination={false}
        selected={selectedDatabase}
        setSelected={handleSelectChange}
        // page={currentPage}
        // onChangePage={handlePageChange}
        // rowsPerPage={pageSize}
        // setRowsPerPage={handlePageSize}
        // isLoading={loading}
        // order={order}
        // orderBy={orderBy}
        // handleSort={handleGridSort}
      />
    </div>
  );
};

export default Database;
