import { useContext, useEffect, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UserHttp } from '@/http/User';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import { DeleteRoleParams, RoleData } from './Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { rootContext } from '@/context/Root';
import { useNavigationHook } from '@/hooks/Navigation';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import CreateRole from './CreateRoleDialog';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `calc(100vh - 160px)`,
  },
}));

const Roles = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);
  const classes = useStyles();

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleData[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchRoles = async () => {
    const roles = await UserHttp.getRoles();

    setRoles(roles.results.map((v: any) => ({ name: v.role.name })));
  };

  const onCreate = async () => {
    fetchRoles();
    openSnackBar(successTrans('create', { name: userTrans('role') }));
    handleCloseDialog();
  };

  const handleDelete = async () => {
    for (const role of selectedRole) {
      const param: DeleteRoleParams = {
        roleName: role.name,
      };
      await UserHttp.deleteRole(param);
    }

    openSnackBar(successTrans('delete', { name: userTrans('role') }));
    fetchRoles();
    handleCloseDialog();
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: userTrans('role'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <CreateRole onCreate={onCreate} handleClose={handleCloseDialog} />
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
                title={dialogTrans('deleteTitle', { type: userTrans('role') })}
                text={userTrans('deleteWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: '',
      disabled: () =>
        selectedRole.length === 0 ||
        selectedRole.findIndex(v => v.name === 'root') > -1,
      disabledTooltip: userTrans('deleteTip'),

      icon: 'delete',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'name',
      align: 'left',
      disablePadding: false,
      label: userTrans('role'),
    },
  ];

  const handleSelectChange = (value: RoleData[]) => {
    setSelectedRole(value);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className={classes.wrapper}>
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={roles}
        rowCount={roles.length}
        primaryKey="name"
        showPagination={false}
        selected={selectedRole}
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

export default Roles;
