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
import type { DeleteRoleParams } from './Types';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import type {
  RolesWithPrivileges,
  RBACOptions,
  DBCollectionsPrivileges,
} from '@server/types';

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

  const [roles, setRoles] = useState<RolesWithPrivileges[]>([]);
  const [rbacOptions, setRbacOptions] = useState<RBACOptions>(
    {} as RBACOptions
  );
  const [selectedRole, setSelectedRole] = useState<RolesWithPrivileges[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchRoles = async () => {
    setLoading(true);

    const [roles, rbacs] = await Promise.all([
      UserService.getRoles(),
      UserService.getRBAC(),
    ]);

    setSelectedRole([]);
    setRbacOptions(rbacs);

    setRoles(roles as any);
    setLoading(false);
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
        roleName: role.roleName,
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
                role={{ roleName: '', privileges: {} }}
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
        selectedRole.findIndex(v => v.roleName === 'admin') > -1 ||
        selectedRole.findIndex(v => v.roleName === 'public') > -1,
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
        selectedRole.findIndex(v => v.roleName === 'admin') > -1 ||
        selectedRole.findIndex(v => v.roleName === 'public') > -1,
      disabledTooltip: userTrans('deleteTip'),
      icon: 'delete',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'roleName',
      align: 'left',
      disablePadding: false,
      label: userTrans('role'),
      sortType: 'string',
    },

    {
      id: 'privileges',
      align: 'left',
      disablePadding: false,
      formatter({ privileges, roleName }) {
        const isAdmin = roleName === 'admin';

        // Derive the options arrays as in DBCollectionSelector.
        const rbacEntries = Object.entries(rbacOptions) as [
          string,
          Record<string, string>
        ][];

        // privileges of the privilege groups
        const privilegeGroups = rbacEntries.filter(([key]) =>
          key.endsWith('PrivilegeGroups')
        );

        const groupPrivileges = new Set(
          privilegeGroups.reduce(
            (acc, [_, group]) => acc.concat(Object.values(group)),
            [] as string[]
          )
        );

        let groupCount = 0;
        let privilegeCount = 0;

        Object.values(privileges as DBCollectionsPrivileges).forEach(
          dbPrivileges => {
            Object.values(dbPrivileges.collections).forEach(
              collectionPrivileges => {
                Object.keys(collectionPrivileges).forEach(privilege => {
                  if (groupPrivileges.has(privilege)) {
                    groupCount++;
                  } else {
                    privilegeCount++;
                  }
                });
              }
            );
          }
        );

        return (
          <div>
            {
              <>
                <div style={{ marginBottom: 2 }}>
                  <Chip
                    label={`${userTrans('Group')} (${
                      isAdmin ? '*' : groupCount
                    })`}
                    size="small"
                    style={{ marginRight: 2 }}
                  />
                </div>
                <div style={{ marginBottom: 2 }}>
                  <Chip
                    label={`${userTrans('privileges')} (${
                      isAdmin ? '*' : privilegeCount
                    })`}
                    size="small"
                    style={{ marginRight: 2 }}
                  />
                </div>
              </>
            }
          </div>
        );
      },
      label: userTrans('privileges'),
      getStyle: () => {
        return {
          width: '70%',
        };
      },
    },
  ];

  const handleSelectChange = (value: any[]) => {
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
        primaryKey="roleName"
        showPagination={true}
        selected={selectedRole}
        setSelected={handleSelectChange}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        rowHeight={52}
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
