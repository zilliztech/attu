import { UserHttp } from '../../http/User';
import React, { useContext, useEffect, useState } from 'react';
import AttuGrid from 'insight_src/components/grid/Grid';
import {
  ColDefinitionsType,
  ToolBarConfig,
} from 'insight_src/components/grid/Types';
import { makeStyles, Theme } from '@material-ui/core';
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  UserData,
} from './Types';
import { rootContext } from 'insight_src/context/Root';
import CreateUser from './Create';
import { useTranslation } from 'react-i18next';
import DeleteTemplate from 'insight_src/components/customDialog/DeleteDialogTemplate';
import UpdateUser from './Update';
import { useNavigationHook } from 'insight_src/hooks/Navigation';
import { ALL_ROUTER_TYPES } from 'insight_src/router/Types';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    position: 'relative',
    left: ' -10px',
    '& .MuiButton-root': {
      color: theme.palette.primary.main,
    },
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
      label: 'Create user',
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
                label={btnTrans('delete')}
                title={dialogTrans('deleteTitle', { type: userTrans('user') })}
                text={userTrans('deleteWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: '',
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
          text: 'Update password',
          className: classes.actionButton,
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
