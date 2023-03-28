import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserHttp } from '../../http/User';
import AttuGrid from '../../components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '../../components/grid/Types';
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  UserData,
} from './Types';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import { rootContext } from '../../context/Root';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import CreateUser from './Create';
import UpdateUser from './Update';

const Users = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);

  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchUsers = async () => {
    const res = await UserHttp.getUsers();

    setUsers(res.usernames.map((v: string) => ({ name: v })));
  };

  const handleCreate = async (data: CreateUserParams) => {
    await UserHttp.createUser(data);
    fetchUsers();
    openSnackBar(successTrans('create', { name: userTrans('user') }));
    handleCloseDialog();
  };

  const handleUpdate = async (data: UpdateUserParams) => {
    await UserHttp.updateUser(data);
    fetchUsers();
    openSnackBar(successTrans('update', { name: userTrans('user') }));
    handleCloseDialog();
  };

  const handleDelete = async () => {
    for (const user of selectedUser) {
      const param: DeleteUserParams = {
        username: user.name,
      };
      await UserHttp.deleteUser(param);
    }

    openSnackBar(successTrans('delete', { name: userTrans('user') }));
    fetchUsers();
    handleCloseDialog();
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: userTrans('createTitle'),
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
      label: 'Name',
    },
    {
      id: 'action',
      disablePadding: false,
      label: 'Action',
      showActionCell: true,
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
    <div className="page-wrapper">
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

export default Users;
