import { useContext, useEffect, useState } from 'react';
import { Theme } from '@mui/material';
import { List, ListItemButton, ListItemText, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserService } from '@/http';
import { rootContext, dataContext } from '@/context';
import { useNavigationHook } from '@/hooks';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import UpdateRoleDialog from './dialogs/UpdateRoleDialog';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import CustomToolBar from '@/components/grid/ToolBar';
import { makeStyles } from '@mui/styles';
import type {
  ColDefinitionsType,
  ToolBarConfig,
} from '@/components/grid/Types';
import Wrapper from '@/components/layout/Wrapper';
import type { DeleteRoleParams, CreateRoleParams } from './Types';
import type { RolesWithPrivileges } from '@server/types';
import D3PrivilegeTree from './D3PrivilegeTree';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  list: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.background.light,
    width: '16%',
    height: 'calc(100vh - 200px)',
    overflow: 'auto',
    color: theme.palette.text.primary,
  },
  tree: {
    overflow: 'auto',
  },
  chip: {
    marginBottom: theme.spacing(0.5),
  },
  groupChip: {
    marginBottom: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.light,
  },
}));

const Roles = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);
  // styles
  const classes = useStyles();
  // context
  const { database } = useContext(dataContext);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  // ui states
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RolesWithPrivileges[]>([]);
  const [selectedRole, setSelectedRole] = useState<RolesWithPrivileges[]>([]);
  const [hasPermission, setHasPermission] = useState(true);

  // i18n
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchRoles = async () => {
    setLoading(true);

    try {
      const [roles] = await Promise.all([UserService.getRoles()]);

      setSelectedRole([]);

      setRoles(roles as any);

      return roles;
    } catch (error) {
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (data: {
    isEditing: boolean;
    data: CreateRoleParams;
  }) => {
    const newRoles = await fetchRoles();
    openSnackBar(
      successTrans(data.isEditing ? 'update' : 'create', {
        name: userTrans('role'),
      })
    );
    handleCloseDialog();

    const roleName = data.data.roleName;
    const role = newRoles!.find(role => role.roleName === roleName);
    if (role) {
      setSelectedRole([role]);
    }
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
      label: btnTrans('edit'),
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
      label: btnTrans('duplicate'),
      onClick: async () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <UpdateRoleDialog
                role={{
                  ...selectedRole[0],
                  roleName: selectedRole[0].roleName + '_copy',
                }}
                onUpdate={onUpdate}
                handleClose={handleCloseDialog}
                sameAs={true}
              />
            ),
          },
        });
      },
      icon: 'copy',
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
                text={userTrans('deleteRoleWarning')}
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
      disabledTooltip: userTrans('deleteRoleTip'),
      icon: 'delete',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    // {
    //   id: 'privileges',
    //   align: 'left',
    //   disablePadding: false,
    //   label: userTrans('privilegeGroups'),
    //   notSort: true,
    //   formatter({ privileges, roleName }) {
    //     const isAdmin = roleName === 'admin';
    //     // Derive the options arrays as in DBCollectionSelector.
    //     const rbacEntries = Object.entries(rbacOptions) as [
    //       string,
    //       Record<string, string>
    //     ][];
    //     // privileges of the privilege groups
    //     const privilegeGroups = rbacEntries.filter(([key]) =>
    //       key.endsWith('PrivilegeGroups')
    //     );
    //     const groupPrivileges = new Set(
    //       privilegeGroups.reduce(
    //         (acc, [_, group]) => acc.concat(Object.values(group)),
    //         [] as string[]
    //       )
    //     );
    //     let groups: string[] = [];
    //     Object.values(privileges as DBCollectionsPrivileges).forEach(
    //       dbPrivileges => {
    //         Object.values(dbPrivileges.collections).forEach(
    //           collectionPrivileges => {
    //             Object.keys(collectionPrivileges).forEach(privilege => {
    //               if (groupPrivileges.has(privilege)) {
    //                 groups.push(privilege);
    //               }
    //             });
    //           }
    //         );
    //       }
    //     );
    //     return (
    //       <div style={{ marginBottom: 2 }}>
    //         {groups.map((group, i) => (
    //           <>
    //             <Chip
    //               className={classes.groupChip}
    //               key={group}
    //               label={group}
    //               size="small"
    //               style={{ marginRight: 2 }}
    //             />
    //             <br />
    //           </>
    //         ))}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   id: 'privileges',
    //   align: 'left',
    //   label: 'test',
    //   disablePadding: false,
    //   formatter({ privileges, roleName }) {
    //     return <D3PrivilegeTree privileges={privileges} />;
    //   },
    // },
    // {
    //   id: 'privileges',
    //   align: 'left',
    //   disablePadding: false,
    //   formatter({ privileges, roleName }) {
    //     const isAdmin = roleName === 'admin';
    //     // Derive the options arrays as in DBCollectionSelector.
    //     const rbacEntries = Object.entries(rbacOptions) as [
    //       string,
    //       Record<string, string>
    //     ][];
    //     // privileges of the privilege groups
    //     const privilegeGroups = rbacEntries.filter(([key]) =>
    //       key.endsWith('PrivilegeGroups')
    //     );
    //     const groupPrivileges = new Set(
    //       privilegeGroups.reduce(
    //         (acc, [_, group]) => acc.concat(Object.values(group)),
    //         [] as string[]
    //       )
    //     );
    //     const formatedStrings = [];
    //     for (const dbName of Object.keys(privileges)) {
    //       const db = privileges[dbName];
    //       for (const collectionName of Object.keys(db.collections)) {
    //         const collection = db.collections[collectionName];
    //         for (const privilegeName of Object.keys(collection)) {
    //           if (
    //             collection[privilegeName] &&
    //             !groupPrivileges.has(privilegeName)
    //           ) {
    //             formatedStrings.push(
    //               `${dbName}/${collectionName}/${privilegeName}`
    //             );
    //           }
    //         }
    //       }
    //     }
    //     return (
    //       <div>
    //         <div style={{ marginBottom: 2 }}>
    //           {formatedStrings.map(privilege => (
    //             <>
    //               <Chip
    //                 className={classes.chip}
    //                 key={privilege}
    //                 label={privilege}
    //                 size="small"
    //                 style={{ marginRight: 2 }}
    //               />
    //               <br />
    //             </>
    //           ))}
    //         </div>
    //       </div>
    //     );
    //   },
    //   label: userTrans('privileges'),
    //   getStyle: () => {
    //     return {
    //       width: '80%',
    //     };
    //   },
    // },
  ];

  useEffect(() => {
    fetchRoles();
  }, [database]);

  const handleRoleClick = (role: RolesWithPrivileges) => {
    setSelectedRole([role]);
  };

  return (
    <Wrapper className={classes.wrapper} hasPermission={hasPermission}>
      <CustomToolBar toolbarConfigs={toolbarConfigs} />

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
        <Box className={classes.list}>
          <List>
            {roles.map(role => (
              <ListItemButton
                key={role.roleName}
                selected={
                  selectedRole.length > 0 &&
                  selectedRole[0].roleName === role.roleName
                }
                onClick={() => handleRoleClick(role)}
              >
                <ListItemText primary={role.roleName} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <div className={classes.tree}>
          <D3PrivilegeTree
            privileges={selectedRole[0]?.privileges}
            role={selectedRole[0]?.roleName}
          />
        </div>
      </Box>
    </Wrapper>
  );
};

export default Roles;
