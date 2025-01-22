import { useContext, useEffect, useState } from 'react';
import { Theme, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserService } from '@/http';
import { rootContext, dataContext } from '@/context';
import { useNavigationHook, usePaginationHook } from '@/hooks';
import AttuGrid from '@/components/grid/Grid';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import UpdateRoleDialog from './dialogs/UpdateRoleDialog';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import { makeStyles } from '@mui/styles';
import type {
  ColDefinitionsType,
  ToolBarConfig,
} from '@/components/grid/Types';
import type { DeleteRoleParams, RoleData } from './Types';
import { getLabelDisplayedRows } from '@/pages/search/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `calc(100vh - 160px)`,
  },
  chip: {
    marginRight: theme.spacing(0.5),
  },
}));

const Roles = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);
  const classes = useStyles();
  const { database } = useContext(dataContext);
  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState<RoleData[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleData[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchRoles = async () => {
    const roles = await UserService.getRoles();
    setSelectedRole([]);

    setRoles(
      roles.results.map(v => ({
        name: v.role.name,
        privilegeContent: v,
        privileges: v.entities.map(e => ({
          roleName: v.role.name,
          object: e.object.name,
          objectName: e.object_name,
          privilegeName: e.grantor.privilege.name,
        })),
      }))
    );
  };

  const onUpdate = async (data: { isEditing: boolean }) => {
    fetchRoles();
    openSnackBar(
      successTrans(data.isEditing ? 'update' : 'create', {
        name: userTrans('role'),
      })
    );
    handleCloseDialog();
  };

  const handleDelete = async (force?: boolean) => {
    for (const role of selectedRole) {
      const param: DeleteRoleParams = {
        roleName: role.name,
        force,
      };
      await UserService.deleteRole(param);
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
              <UpdateRoleDialog
                onUpdate={onUpdate}
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
      label: userTrans('editRole'),
      onClick: async () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <UpdateRoleDialog
                role={selectedRole[0]}
                onUpdate={onUpdate}
                handleClose={handleCloseDialog}
              />
            ),
          },
        });
      },
      icon: 'edit',
      disabled: () =>
        selectedRole.length === 0 ||
        selectedRole.length > 1 ||
        selectedRole.findIndex(v => v.name === 'admin') > -1 ||
        selectedRole.findIndex(v => v.name === 'public') > -1,
      disabledTooltip: userTrans('disableEditRolePrivilegeTip'),
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
                title={dialogTrans('deleteTitle', { type: userTrans('role') })}
                text={userTrans('deleteWarning')}
                handleDelete={handleDelete}
                forceDelLabel={userTrans('forceDelLabel')}
              />
            ),
          },
        });
      },
      label: btnTrans('drop'),
      disabled: () =>
        selectedRole.length === 0 ||
        selectedRole.findIndex(v => v.name === 'admin') > -1 ||
        selectedRole.findIndex(v => v.name === 'public') > -1,
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

    {
      id: 'privilegeContent',
      align: 'left',
      disablePadding: false,
      formatter({ privilegeContent }) {
        return (
          <>
            {privilegeContent.entities.map((e: any) => {
              return (
                <Chip
                  key={`${e.object.name}-${e.grantor.privilege.name}`}
                  className={classes.chip}
                  size="small"
                  label={e.grantor.privilege.name}
                  variant="outlined"
                />
              );
            })}
          </>
        );
      },
      label: userTrans('privileges'),
    },
  ];

  const handleSelectChange = (value: RoleData[]) => {
    setSelectedRole(value);
  };

  useEffect(() => {
    fetchRoles();
  }, [database]);

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
  } = usePaginationHook(roles || []);

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
        primaryKey="name"
        showPagination={true}
        selected={selectedRole}
        setSelected={handleSelectChange}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        isLoading={loading}
        order={order}
        orderBy={orderBy}
        handleSort={handleGridSort}
        labelDisplayedRows={getLabelDisplayedRows(userTrans('roles'))}
      />
    </div>
  );
};

export default Roles;
