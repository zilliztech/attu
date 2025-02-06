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
import type { DeleteRoleParams, RBACOptions } from './Types';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import type { RolesWithPrivileges } from '@server/types';

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

  const [roles, setRoles] = useState<any[]>([]);
  const [rbacOptions, setRbacOptions] = useState<RBACOptions>({});
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
    },

    {
      id: 'privileges',
      align: 'left',
      disablePadding: false,
      formatter({ privileges }) {
        // Assume rbacOptions is available in this scope or imported from your config.
        // The global categories defined in your RBAC classification:
        const globalPrivilegeCategories = [
          'DatabasePrivileges',
          'ResourceManagementPrivileges',
          'RBACPrivileges',
        ];

        // Derive the options arrays as in DBCollectionSelector.
        const rbacEntries = Object.entries(rbacOptions) as [
          string,
          Record<string, string>
        ][];
        const databasePrivilegeOptions = rbacEntries.filter(
          ([category]) => category === 'DatabasePrivileges'
        );
        const instancePrivilegeOptions = rbacEntries.filter(
          ([category]) =>
            category === 'ResourceManagementPrivileges' ||
            category === 'RBACPrivileges'
        );
        // Collection privileges are those not in the globalPrivilegeCategories.
        const collectionPrivilegeOptions = rbacEntries.filter(
          ([category]) => !globalPrivilegeCategories.includes(category)
        );

        // Build sets of known privilege keys for each category.
        const dbPrivSet = new Set(
          databasePrivilegeOptions
            .map(([_, rec]) => Object.keys(rec))
            .reduce((acc, val) => acc.concat(val), [])
        );
        const instPrivSet = new Set(
          instancePrivilegeOptions
            .map(([_, rec]) => Object.keys(rec))
            .reduce((acc, val) => acc.concat(val), [])
        );
        const collPrivSet = new Set(
          collectionPrivilegeOptions
            .map(([_, rec]) => Object.keys(rec))
            .reduce((acc, val) => acc.concat(val), [])
        );

        // Global privileges from the privileges prop.
        const globalPrivilegesObj = privileges['*']?.collections?.['*'] || {};

        let collectionCount = 0;
        let databaseCount = 0;
        let instanceCount = 0;

        Object.keys(globalPrivilegesObj).forEach(key => {
          if (dbPrivSet.has(key)) {
            databaseCount++;
          } else if (instPrivSet.has(key)) {
            instanceCount++;
          } else if (collPrivSet.has(key)) {
            collectionCount++;
          } else {
            // Fallback: if key is not found in any option list, count it into Collection.
            collectionCount++;
          }
        });

        // Get all database entries excluding the top-level "*"
        const dbEntries = Object.entries(privileges).filter(
          ([key]) => key !== '*'
        ) as any[];

        return (
          <div>
            {(collectionCount > 0 ||
              databaseCount > 0 ||
              instanceCount > 0) && (
              <div style={{ marginBottom: 4 }}>
                <Chip
                  label={`Collection (*) (${collectionCount})`}
                  size="small"
                  style={{ marginRight: 4 }}
                />
                <Chip
                  label={`Database (${databaseCount})`}
                  size="small"
                  style={{ marginRight: 4 }}
                />
                <Chip
                  label={`Instance (${instanceCount})`}
                  size="small"
                  style={{ marginRight: 4 }}
                />
              </div>
            )}
            {dbEntries.map(([dbName, dbData]) => {
              const collections = dbData.collections || {};
              return (
                <div key={dbName} style={{ marginTop: 4 }}>
                  {(Object.entries(collections) as any[]).map(
                    ([colName, privileges]) => {
                      const count = Object.keys(privileges).length;
                      const displayName =
                        colName === '*' ? 'All Collections' : colName;
                      return (
                        <Chip
                          key={colName}
                          label={`${dbName}/${displayName} (${count})`}
                          size="small"
                          style={{ marginRight: 4, marginTop: 4 }}
                        />
                      );
                    }
                  )}
                </div>
              );
            })}
          </div>
        );
      },
      label: userTrans('privileges'),
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
