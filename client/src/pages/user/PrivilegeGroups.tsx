import { useContext, useEffect, useState } from 'react';
import { Theme, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserService } from '@/http';
import { rootContext } from '@/context';
import { useNavigationHook, usePaginationHook } from '@/hooks';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import UpdatePrivilegeGroupDialog from './dialogs/UpdatePrivilegeGroupDialog';
import { makeStyles } from '@mui/styles';
import { PrivilegeGroup } from '@server/types';
import { getLabelDisplayedRows } from '@/pages/search/Utils';

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

  const [groups, setGroups] = useState<PrivilegeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<PrivilegeGroup[]>([]);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: successTrans } = useTranslation('success');
  const { t: userTrans } = useTranslation('user');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const fetchGroups = async () => {
    setLoading(true);
    const res = await UserService.getPrivilegeGroups();
    setGroups(res.privilege_groups);

    setLoading(false);
  };

  const onUpdate = async (data: { isEditing: boolean }) => {
    handleCloseDialog();
    await fetchGroups();
    // update selected groups
    setSelectedGroups([]);
    // open snackbar
    openSnackBar(
      successTrans(data.isEditing ? 'update' : 'create', {
        name: userTrans('privilegeGroup'),
      })
    );
  };

  const handleDelete = async () => {
    // delete selected groups
    for (const group of selectedGroups) {
      await UserService.deletePrivilegeGroup({ group_name: group.group_name });
    }
    // open snackbar
    openSnackBar(successTrans('delete', { name: userTrans('privilegeGroup') }));
    // update groups
    await fetchGroups();
    // update selected groups
    setSelectedGroups([]);
    // close dialog
    handleCloseDialog();
  };

  useEffect(() => {
    fetchGroups();
  }, []);

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
  } = usePaginationHook(groups || []);

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: userTrans('privilegeGroup'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <UpdatePrivilegeGroupDialog
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
      label: userTrans('editPrivilegeGroup'),
      onClick: async () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <UpdatePrivilegeGroupDialog
                group={selectedGroups[0]}
                onUpdate={onUpdate}
                handleClose={handleCloseDialog}
              />
            ),
          },
        });
      },
      disabled: () => selectedGroups.length !== 1,
      icon: 'edit',
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
                title={dialogTrans('deleteTitle', {
                  type: userTrans('privilegeGroup'),
                })}
                text={userTrans('deletePrivilegGroupWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: btnTrans('drop'),
      disabledTooltip: userTrans('deleteTip'),
      icon: 'delete',
    },
  ];

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

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
                variant="filled"
              />
            ))}
          </div>
        );
      },
      label: userTrans('privileges'),
    },
  ];

  const handleSelectChange = (groups: PrivilegeGroup[]) => {
    setSelectedGroups(groups);
  };

  return (
    <div className={classes.wrapper}>
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={result}
        rowCount={total}
        primaryKey="group_name"
        showPagination={true}
        selected={selectedGroups}
        setSelected={handleSelectChange}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        isLoading={loading}
        order={order}
        orderBy={orderBy}
        rowHeight={49}
        handleSort={handleGridSort}
        labelDisplayedRows={getLabelDisplayedRows(userTrans('privilegeGroups'))}
      />
    </div>
  );
};

export default PrivilegeGroups;
