import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database } from '@/http';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import {
  CreateDatabaseParams,
  DropDatabaseParams,
  DatabaseData,
} from './Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { rootContext, dataContext } from '@/context';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import CreateUser from './Create';

const DatabaseAdminPage = () => {
  useNavigationHook(ALL_ROUTER_TYPES.DB_ADMIN);
  const { setDatabaseList } = useContext(dataContext);

  const [databases, setDatabases] = useState<DatabaseData[]>([
    { name: 'default' },
  ]);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseData[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchDatabases = async () => {
    try {
      const res = await Database.getDatabases();
      setDatabases(res.db_names.map((v: string) => ({ name: v })));
      setDatabaseList(res.db_names);
    } catch (error) {
      // do nothing
    }
  };

  const handleCreate = async (data: CreateDatabaseParams) => {
    await Database.createDatabase(data);
    fetchDatabases();
    openSnackBar(successTrans('create', { name: dbTrans('database') }));
    handleCloseDialog();
  };

  const handleDelete = async () => {
    for (const db of selectedDatabase) {
      const param: DropDatabaseParams = {
        db_name: db.name,
      };
      await Database.dropDatabase(param);
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
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
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
      label: btnTrans('drop'),
      disabled: () =>
        selectedDatabase.length === 0 ||
        selectedDatabase.findIndex(v => v.name === 'default') > -1,
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
        // onPageChange={handlePageChange}
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

export default DatabaseAdminPage;
