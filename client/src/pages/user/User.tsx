import React, { useContext, useEffect, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { User } from '@/http';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  UserData,
  UpdateUserRoleParams,
} from './Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { rootContext } from '@/context';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import CreateUser from './CreateUser';
import UpdateUserRole from './UpdateUserRole';
import UpdateUser from './Update';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `calc(100vh - 160px)`,
  },
}));

const Users = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);
  const classes = useStyles();

  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchUsers = async () => {
    const res = await User.getUsers();
    const roles = await User.getRoles();

    setUsers(
      res.usernames.map((v: string) => {
        const name = v;
        const rolesByName = roles.results.filter((r: any) =>
          r.users.map((u: any) => u.name).includes(name)
        );
        const originRoles =
          v === 'root' ? ['admin'] : rolesByName.map((r: any) => r.role.name);
        return {
          name: v,
          role: originRoles.join(' , '),
          roles: originRoles,
        };
      })
    );
  };

  const handleCreate = async (data: CreateUserParams) => {
    await User.createUser(data);
    // assign user role if
    await User.updateUserRole({
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
    await User.updateUser(data);
    fetchUsers();
    openSnackBar(successTrans('update', { name: userTrans('user') }));
    handleCloseDialog();
  };

  const handleDelete = async () => {
    for (const user of selectedUser) {
      const param: DeleteUserParams = {
        username: user.name,
      };
      await User.deleteUser(param);
    }

    openSnackBar(successTrans('delete', { name: userTrans('user') }));
    fetchUsers();
    handleCloseDialog();
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: userTrans('user'),
      onClick: async () => {
        const roles = await User.getRoles();
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <CreateUser
                handleCreate={handleCreate}
                handleClose={handleCloseDialog}
                roleOptions={roles.results.map((r: any) => {
                  return { label: r.role.name, value: r.role.name };
                })}
              />
            ),
          },
        });
      },
      icon: 'add',
    },

    {
      type: 'iconBtn',
      label: userTrans('editRole'),
      onClick: async () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <UpdateUserRole
                username={selectedUser[0]!.name}
                onUpdate={onUpdate}
                handleClose={handleCloseDialog}
                roles={
                  users.filter(u => u.name === selectedUser[0].name)[0].roles
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
        selectedUser.findIndex(v => v.name === 'root') > -1,
      disabledTooltip: userTrans('deleteEditRoleTip'),
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
                title={dialogTrans('deleteTitle', { type: userTrans('user') })}
                text={userTrans('deleteWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: '',
      disabled: () =>
        selectedUser.length === 0 ||
        selectedUser.findIndex(v => v.name === 'root') > -1,
      disabledTooltip: userTrans('deleteTip'),
      icon: 'delete',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'name',
      align: 'left',
      disablePadding: false,
      label: userTrans('user'),
    },
    {
      id: 'role',
      align: 'left',
      disablePadding: false,
      label: userTrans('role'),
    },
    {
      id: 'action',
      disablePadding: false,
      label: 'Action',
      showActionCell: true,
      sortBy: 'action',
      actionBarConfigs: [
        {
          onClick: (e: React.MouseEvent, row: UserData) => {
            setDialog({
              open: true,
              type: 'custom',
              params: {
                component: (
                  <UpdateUser
                    username={row.name}
                    handleUpdate={handleUpdate}
                    handleClose={handleCloseDialog}
                  />
                ),
              },
            });
          },
          linkButton: true,
          text: 'Update password',
        },
      ],
    },
  ];

  const handleSelectChange = (value: UserData[]) => {
    setSelectedUser(value);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={classes.wrapper}>
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={users}
        rowCount={users.length}
        primaryKey="name"
        showPagination={false}
        selected={selectedUser}
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

export default Users;
