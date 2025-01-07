import { useContext, useEffect, useState } from 'react';
import { Theme, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserService } from '@/http';
import { rootContext } from '@/context';
import { useNavigationHook } from '@/hooks';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import { DeleteRoleParams, PrivilegeGroupData } from './Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import UpdateRoleDialog from './dialogs/UpdateRoleDialog';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `calc(100vh - 160px)`,
  },
  chip: {
    marginRight: theme.spacing(0.5),
  },
}));

const PrivilegeGroups = () => {
  useNavigationHook(ALL_ROUTER_TYPES.USER);
  const classes = useStyles();

  const [groups, setGroups] = useState<PrivilegeGroupData>([]);
  const [selectedRole, setSelectedRole] = useState<PrivilegeGroupData>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchGroups = async () => {
    const res = await UserService.getPrivilegeGroups();

    setGroups(res.privilege_groups);
  };

  const onUpdate = async (data: { isEditing: boolean }) => {
    handleCloseDialog();
  };

  const handleDelete = async (force?: boolean) => {
    handleCloseDialog();
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const toolbarConfigs: ToolBarConfig[] = [
    // {
    //   label: userTrans('role'),
    //   onClick: () => {
    //     setDialog({
    //       open: true,
    //       type: 'custom',
    //       params: {
    //         component: (
    //           <UpdateRoleDialog
    //             onUpdate={onUpdate}
    //             handleClose={handleCloseDialog}
    //           />
    //         ),
    //       },
    //     });
    //   },
    //   icon: 'add',
    // },
    // {
    //   type: 'button',
    //   btnVariant: 'text',
    //   btnColor: 'secondary',
    //   label: userTrans('editRole'),
    //   onClick: async () => {
    //     setDialog({
    //       open: true,
    //       type: 'custom',
    //       params: {
    //         component: (
    //           <UpdateRoleDialog
    //             role={selectedRole[0]}
    //             onUpdate={onUpdate}
    //             handleClose={handleCloseDialog}
    //           />
    //         ),
    //       },
    //     });
    //   },
    //   icon: 'edit',
    //   disabled: () =>
    //     selectedRole.length === 0 ||
    //     selectedRole.length > 1 ||
    //     selectedRole.findIndex(v => v.name === 'admin') > -1 ||
    //     selectedRole.findIndex(v => v.name === 'public') > -1,
    //   disabledTooltip: userTrans('disableEditRolePrivilegeTip'),
    // },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'group_name',
      align: 'left',
      disablePadding: false,
      label: userTrans('name'),
    },

    {
      id: 'privileges',
      align: 'left',
      disablePadding: false,
      formatter({ privileges }) {
        return (
          <div>
            {privileges.map((privilege: { name: string }, index: number) => (
              <Chip
                key={index}
                label={privilege.name}
                className={classes.chip}
                color="primary"
                variant='filled'
              />
            ))}
          </div>
        );
      },
      label: userTrans('privileges'),
    },
  ];

  const handleSelectChange = (value: any[]) => {};

  return (
    <div className={classes.wrapper}>
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={groups}
        rowCount={groups.length}
        primaryKey="name"
        showPagination={false}
        selected={selectedRole}
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

export default PrivilegeGroups;
