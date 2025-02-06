import React, { useContext, useEffect, useState } from 'react';
import { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserService } from '@/http';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  UpdateUserRoleParams,
} from './Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { rootContext } from '@/context';
import { useNavigationHook, usePaginationHook } from '@/hooks';
import CreateUser from './dialogs/CreateUserDialog';
import UpdateUserRole from './dialogs/UpdateUserRole';
import UpdateUser from './dialogs/UpdateUserPassDialog';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import { makeStyles } from '@mui/styles';
import type { UserWithRoles } from '@server/types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `calc(100vh - 160px)`,
  },
}));

const Users = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);
  const classes = useStyles();

  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchUsers = async () => {
    const res = await UserService.getUsers();

    setUsers(res);
  };

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: result,
    order,
    orderBy,
    handleGridSort,
  } = usePaginationHook(users || []);

  const handleCreate = async (data: CreateUserParams) => {
    await UserService.createUser(data);
    // assign user role if
    await UserService.updateUserRole({
      username: data.username,
      roles: data.roles,
    });

    fetchUsers();
    openSnackBar(successTrans('create', { name: userTrans('user') }));
    handleCloseDialog();
  };

  const onUpdate = async (data: UpdateUserRoleParams) => {
    fetchUsers();
    openSnackBar(
      successTrans('update', { name: userTrans('updateRoleSuccess') })
    );
    handleCloseDialog();
  };

  const handleUpdate = async (data: UpdateUserParams) => {
    await UserService.updateUser(data);
    fetchUsers();
    openSnackBar(successTrans('update', { name: userTrans('user') }));
    handleCloseDialog();
  };

  const handleDelete = async () => {
    for (const user of selectedUser) {
      const param: DeleteUserParams = {
        username: user.username,
      };
      await UserService.deleteUser(param);
    }

    openSnackBar(successTrans('delete', { name: userTrans('user') }));
    fetchUsers();
    handleCloseDialog();
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: userTrans('user'),
      onClick: async () => {
        const roles = await UserService.getRoles();
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <CreateUser
                handleCreate={handleCreate}
                handleClose={handleCloseDialog}
                roleOptions={roles.map(r => {
                  return { label: r.roleName, value: r.roleName };
                })}
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
      label: userTrans('editPassword'),
      onClick: async () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <UpdateUser
                username={selectedUser[0]!.username}
                handleUpdate={handleUpdate}
                handleClose={handleCloseDialog}
              />
            ),
          },
        });
      },
      icon: 'edit',
      disabled: () =>
        selectedUser.length === 0 ||
        selectedUser.length > 1 ||
        selectedUser.findIndex(v => v.username === 'root') > -1,
      disabledTooltip: userTrans('deleteEditRoleTip'),
    },

    {
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      label: userTrans('editRole'),
      onClick: async () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <UpdateUserRole
                username={selectedUser[0]!.username}
                onUpdate={onUpdate}
                handleClose={handleCloseDialog}
                roles={
                  users.filter(u => u.username === selectedUser[0].username)[0]
                    .roles
                }
              />
            ),
          },
        });
      },
      icon: 'edit',
      disabled: () =>
        selectedUser.length === 0 ||
        selectedUser.length > 1 ||
        selectedUser.findIndex(v => v.username === 'root') > -1,
      disabledTooltip: userTrans('deleteEditRoleTip'),
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
                title={dialogTrans('deleteTitle', { type: userTrans('user') })}
                text={userTrans('deleteWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: btnTrans('drop'),
      disabled: () =>
        selectedUser.length === 0 ||
        selectedUser.findIndex(v => v.username === 'root') > -1,
      disabledTooltip: userTrans('deleteTip'),
      icon: 'delete',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'username',
      align: 'left',
      sortType: 'string',
      disablePadding: false,
      label: userTrans('user'),
    },
    {
      id: 'roles',
      align: 'left',
      notSort: true,
      disablePadding: true,
      label: userTrans('role'),
      formatter(_, cellData) {
        return cellData.join(', ');
      },
      getStyle: () => {
        return { width: '70%' };
      },
    },
  ];

  const handleSelectChange = (value: UserWithRoles[]) => {
    setSelectedUser(value);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  return (
    <div className={classes.wrapper}>
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={result}
        rowCount={total}
        primaryKey="username"
        showPagination={true}
        selected={selectedUser}
        setSelected={handleSelectChange}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        // isLoading={loading}
        order={order}
        orderBy={orderBy}
        handleSort={handleGridSort}
      />
    </div>
  );
};

export default Users;
