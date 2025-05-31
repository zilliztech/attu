import { useContext, useEffect, useState } from 'react';
import { List, ListItemButton, ListItemText, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserService } from '@/http';
import { rootContext, dataContext } from '@/context';
import { useNavigationHook } from '@/hooks';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import UpdateRoleDialog from './dialogs/UpdateRoleDialog';
import { ROUTE_PATHS } from '@/config/routes';
import CustomToolBar from '@/components/grid/ToolBar';
import type { ToolBarConfig } from '@/components/grid/Types';
import Wrapper from '@/components/layout/Wrapper';
import type { DeleteRoleParams, CreateRoleParams } from './Types';
import type { RolesWithPrivileges, RBACOptions } from '@server/types';
import D3PrivilegeTree from './D3PrivilegeTree';

const Roles = () => {
  useNavigationHook(ROUTE_PATHS.USERS);
  // context
  const { database } = useContext(dataContext);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  // ui states
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RolesWithPrivileges[]>([]);
  const [rbacOptions, setRbacOptions] = useState<RBACOptions>(
    {} as RBACOptions
  );
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
      const [roles, rbacs] = await Promise.all([
        UserService.getRoles(),
        UserService.getRBAC(),
      ]);

      setSelectedRole([roles[0]]);
      setRbacOptions(rbacs);

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
    await fetchRoles();
    handleCloseDialog();
    setSelectedRole(roles[0] ? [roles[0]] : []);
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
      icon: 'cross',
    },
  ];

  useEffect(() => {
    fetchRoles();
  }, [database]);

  const handleRoleClick = (role: RolesWithPrivileges) => {
    setSelectedRole([role]);
  };

  return (
    <Wrapper hasPermission={hasPermission}>
      <CustomToolBar toolbarConfigs={toolbarConfigs} />

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        <Box
          sx={theme => ({
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.lightGrey,
            width: '16%',
            minWidth: '200px',
            height: 'calc(100vh - 202px)',
            overflow: 'auto',
            color: theme.palette.text.primary,
            padding: theme.spacing(1),
          })}
        >
          <List>
            {roles.map(role => (
              <ListItemButton
                key={role.roleName}
                selected={
                  selectedRole.length > 0 &&
                  selectedRole[0].roleName === role.roleName
                }
                onClick={() => handleRoleClick(role)}
                sx={theme => ({
                  borderRadius: theme.shape.borderRadius,
                  mb: 0.5,
                })}
              >
                <ListItemText primary={role.roleName} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Box
          sx={{
            overflow: 'auto',
            width: 'calc(84% - 16px)',
            flexGrow: 1,
          }}
        >
          <D3PrivilegeTree
            privileges={selectedRole[0]?.privileges}
            role={selectedRole[0]?.roleName}
            rbacOptions={rbacOptions}
          />
        </Box>
      </Box>
    </Wrapper>
  );
};

export default Roles;
