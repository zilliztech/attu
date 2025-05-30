import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserService } from '@/http';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserRoleParams,
} from './Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import Wrapper from '@/components/layout/Wrapper';
import { rootContext } from '@/context';
import { useNavigationHook, usePaginationHook } from '@/hooks';
import CreateUser from './dialogs/CreateUserDialog';
import UpdateUserRole from './dialogs/UpdateUserRole';
import UpdateUser from './dialogs/UpdateUserPassDialog';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import type { UserWithRoles } from '@server/types';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { Typography } from '@mui/material';

const Users = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);

  // ui states
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  // context
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  // i18n
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: commonTrans } = useTranslation();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await UserService.getUsers();

      setUsers(res);
    } catch (error) {
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
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
    const s: any = await UserService.createUser(data);

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

  const onUpdateUserPass = async (res: any) => {
    openSnackBar(successTrans('passwordChanged'));
    fetchUsers();
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
                onUpdate={onUpdateUserPass}
                handleClose={handleCloseDialog}
              />
            ),
          },
        });
      },
      icon: 'edit',
      disabled: () => selectedUser.length === 0 || selectedUser.length > 1,
      disabledTooltip: userTrans('editPassDisabledTip'),
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
      icon: 'cross',
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
      formatter(rowData, cellData) {
        return (
          <Typography variant="body1">
            {rowData.username === 'root' ? 'admin' : cellData.join(', ')}
          </Typography>
        );
      },
      getStyle: () => {
        return { width: '80%', maxWidth: '80%' };
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
    <Wrapper hasPermission={hasPermission}>
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={result}
        rowCount={total}
        primaryKey="username"
        showPagination={true}
        selected={selectedUser}
        tableHeaderHeight={46}
        rowHeight={39}
        tableCellMaxWidth="100%"
        setSelected={handleSelectChange}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        isLoading={loading}
        order={order}
        orderBy={orderBy}
        handleSort={handleGridSort}
        labelDisplayedRows={getLabelDisplayedRows(commonTrans('grid.users'))}
      />
    </Wrapper>
  );
};

export default Users;
