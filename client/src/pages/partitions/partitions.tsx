import { makeStyles, Theme } from '@material-ui/core';
import { FC, useContext, useEffect, useState } from 'react';
import { PartitionManageParam, PartitionParam, PartitionView } from './Types';
import MilvusGrid from '../../components/grid';
import { ColDefinitionsType, ToolBarConfig } from '../../components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook } from '../../hooks/Pagination';
import icons from '../../components/icons/Icons';
import CustomToolTip from '../../components/customToolTip/CustomToolTip';
import { rootContext } from '../../context/Root';
import CreatePartition from './Create';
import { PartitionHttp } from '../../http/Partition';
import Status from '../../components/status/Status';
import { ManageRequestMethods } from '../../types/Common';
import { StatusEnum } from '../../components/status/Types';
import { useDialogHook } from '../../hooks/Dialog';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: '100%',
  },
  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
  },
}));

const Partitions: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const classes = useStyles();
  const { t } = useTranslation('partition');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const InfoIcon = icons.info;
  const LoadIcon = icons.load;
  const ReleaseIcon = icons.release;

  const { handleAction } = useDialogHook({ type: 'partition' });
  const [selectedPartitions, setSelectedPartitions] = useState<PartitionView[]>(
    []
  );
  const [partitions, setPartitions] = useState<PartitionView[]>([]);
  const {
    pageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: partitionList,
  } = usePaginationHook(partitions);
  const [loading, setLoading] = useState<boolean>(true);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  useEffect(() => {
    fetchPartitions(collectionName);
  }, [collectionName]);

  const fetchPartitions = async (collectionName: string) => {
    try {
      const res = await PartitionHttp.getPartitions(collectionName);

      const partitons: PartitionView[] = res.map(p =>
        Object.assign(p, { _statusElement: <Status status={p._status} /> })
      );
      setLoading(false);
      setPartitions(partitons);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    for (const partition of selectedPartitions) {
      const param: PartitionManageParam = {
        partitionName: partition._name,
        collectionName,
        type: ManageRequestMethods.DELETE,
      };
      await PartitionHttp.managePartition(param);
    }

    openSnackBar(successTrans('delete', { name: t('partition') }));
    fetchPartitions(collectionName);
    handleCloseDialog();
  };

  const handleRelease = async (data: PartitionView) => {
    const param: PartitionParam = {
      collectionName,
      partitionNames: [data._name],
    };
    const res = await PartitionHttp.releasePartition(param);
    openSnackBar(successTrans('release', { name: t('partition') }));
    fetchPartitions(collectionName);
    return res;
  };

  const handleLoad = async (data: PartitionView) => {
    const param: PartitionParam = {
      collectionName,
      partitionNames: [data._name!],
    };
    const res = await PartitionHttp.loadPartition(param);
    openSnackBar(successTrans('load', { name: t('partition') }));
    fetchPartitions(collectionName);
    return res;
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: t('create'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <CreatePartition
                handleCreate={handleCreatePartition}
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
                title={dialogTrans('deleteTitle', { type: t('partition') })}
                text={t('deleteWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: '',
      icon: 'delete',
      // can't delete default partition
      disabled: () =>
        selectedPartitions.length === 0 ||
        selectedPartitions.some(p => p._name === '_default'),
      tooltip: selectedPartitions.some(p => p._name === '_default')
        ? t('deletePartitionError')
        : '',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: '_id',
      align: 'left',
      disablePadding: true,
      label: t('id'),
    },
    {
      id: '_formatName',
      align: 'left',
      disablePadding: false,
      label: t('name'),
    },
    {
      id: '_statusElement',
      align: 'left',
      disablePadding: false,
      label: t('status'),
    },
    {
      id: '_rowCount',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center">
          {t('rowCount')}
          <CustomToolTip title={t('tooltip')}>
            <InfoIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
    },
    {
      id: 'action',
      align: 'center',
      disablePadding: false,
      label: '',
      showActionCell: true,
      isHoverAction: true,
      actionBarConfigs: [
        {
          onClick: (e: React.MouseEvent, row: PartitionView) => {
            const cb =
              row._status === StatusEnum.unloaded ? handleLoad : handleRelease;
            handleAction(row, cb);
          },
          icon: 'load',
          label: 'load',
          showIconMethod: 'renderFn',
          getLabel: (row: PartitionView) =>
            row._status === StatusEnum.loaded ? 'release' : 'load',
          renderIconFn: (row: PartitionView) =>
            row._status === StatusEnum.loaded ? <ReleaseIcon /> : <LoadIcon />,
        },
      ],
    },
  ];

  const handleSelectChange = (value: PartitionView[]) => {
    setSelectedPartitions(value);
  };

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
    setSelectedPartitions([]);
  };

  const handleCreatePartition = async (name: string) => {
    const param: PartitionManageParam = {
      partitionName: name,
      collectionName,
      type: ManageRequestMethods.CREATE,
    };

    await PartitionHttp.managePartition(param);

    openSnackBar(successTrans('create', { name: t('partition') }));
    handleCloseDialog();
    // refresh partitions
    fetchPartitions(collectionName);
  };

  return (
    <section className={classes.wrapper}>
      <MilvusGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={partitionList}
        rowCount={total}
        primaryKey="id"
        openCheckBox={true}
        showHoverStyle={true}
        selected={selectedPartitions}
        setSelected={handleSelectChange}
        page={currentPage}
        onChangePage={handlePageChange}
        rowsPerPage={pageSize}
        isLoading={loading}
      />
    </section>
  );
};

export default Partitions;
