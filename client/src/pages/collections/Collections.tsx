import { useContext, useEffect, useState } from 'react';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import MilvusGrid from '../../components/grid';
import CustomToolBar from '../../components/grid/ToolBar';
import { CollectionCreateParam, CollectionView } from './Types';
import { ColDefinitionsType, ToolBarConfig } from '../../components/grid/Types';
import { usePaginationHook } from '../../hooks/Pagination';
import icons from '../../components/icons/Icons';
import EmptyCard from '../../components/cards/EmptyCard';
import Status from '../../components/status/Status';
import { useTranslation } from 'react-i18next';
import { StatusEnum } from '../../components/status/Types';
import { makeStyles, Theme, Link, Typography } from '@material-ui/core';
import StatusIcon from '../../components/status/StatusIcon';
import CustomToolTip from '../../components/customToolTip/CustomToolTip';
import { rootContext } from '../../context/Root';
import CreateCollection from './Create';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import { CollectionHttp } from '../../http/Collection';

const useStyles = makeStyles((theme: Theme) => ({
  emptyWrapper: {
    marginTop: theme.spacing(2),
  },

  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
  },

  dialogContent: {
    lineHeight: '24px',
    fontSize: '16px',
  },
}));

const Collections = () => {
  useNavigationHook(ALL_ROUTER_TYPES.COLLECTIONS);
  const {
    pageSize,
    currentPage,
    handleCurrentPage,
    // offset,
    total,
    // setTotal
  } = usePaginationHook();
  const [collections, setCollections] = useState<CollectionView[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  const [selectedCollections, setSelectedCollections] = useState<
    CollectionView[]
  >([]);

  const { setDialog, handleCloseDialog } = useContext(rootContext);
  const { t } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const classes = useStyles();

  const loading = false;

  const LoadIcon = icons.load;
  const ReleaseIcon = icons.release;
  const InfoIcon = icons.info;

  const fetchData = async () => {
    const res = await CollectionHttp.getCollections();
    setCollections(
      res.map(v => {
        Object.assign(v, {
          nameElement: (
            <Link href="/overview" underline="always" color="textPrimary">
              {v._name}
            </Link>
          ),
          statusElement: <Status status={v._status} />,
          indexCreatingElement: <StatusIcon type="creating" />,
        });

        return v;
      })
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCollection = (param: CollectionCreateParam) => {
    handleCloseDialog();
  };

  const handleRelease = async (data: CollectionView) => {};

  const handleLoad = async (data: CollectionView) => {};

  const handleDelete = async () => {
    console.log('selected', selectedCollections);
  };

  const handleAction = (data: CollectionView) => {
    const actionType: 'release' | 'load' =
      data._status === StatusEnum.loaded ? 'release' : 'load';

    const actionsMap = {
      release: {
        title: t('releaseTitle'),
        component: (
          <Typography className={classes.dialogContent}>
            {t('releaseContent')}
          </Typography>
        ),
        confirmLabel: t('releaseConfirmLabel'),
        confirm: () => handleRelease(data),
      },
      load: {
        title: t('loadTitle'),
        component: (
          <Typography className={classes.dialogContent}>
            {t('loadContent')}
          </Typography>
        ),
        confirmLabel: t('loadConfirmLabel'),
        confirm: () => handleLoad(data),
      },
    };

    const { title, component, confirmLabel, confirm } = actionsMap[actionType];

    setDialog({
      open: true,
      type: 'notice',
      params: {
        title,
        component,
        confirmLabel,
        confirm,
      },
    });
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
              <CreateCollection handleCreate={handleCreateCollection} />
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
                title={dialogTrans('deleteTitle', { type: t('collection') })}
                text={t('deleteWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: t('delete'),
      icon: 'delete',
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
      id: 'nameElement',
      align: 'left',
      disablePadding: true,
      label: t('name'),
    },
    {
      id: 'statusElement',
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
      id: '_desc',
      align: 'left',
      disablePadding: false,
      label: t('desc'),
    },
    {
      id: 'indexCreatingElement',
      align: 'left',
      disablePadding: false,
      label: '',
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
          onClick: (e: React.MouseEvent, row: CollectionView) => {
            handleAction(row);
          },
          icon: 'load',
          label: 'load',
          showIconMethod: 'renderFn',
          getLabel: (row: CollectionView) =>
            row._status === StatusEnum.loaded ? 'release' : 'load',
          renderIconFn: (row: CollectionView) =>
            row._status === StatusEnum.loaded ? <ReleaseIcon /> : <LoadIcon />,
        },
      ],
    },
  ];

  const handleSelectChange = (value: any) => {
    setSelectedCollections(value);
  };

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
    setSelectedCollections([]);
  };

  const CollectionIcon = icons.navCollection;

  return (
    <section className="page-wrapper">
      {collections.length > 0 || loading ? (
        <MilvusGrid
          toolbarConfigs={toolbarConfigs}
          colDefinitions={colDefinitions}
          rows={collections}
          rowCount={total}
          primaryKey="id"
          openCheckBox={true}
          showHoverStyle={true}
          selected={selectedCollections}
          setSelected={handleSelectChange}
          page={currentPage}
          onChangePage={handlePageChange}
          rowsPerPage={pageSize}
          // isLoading={loading}
        />
      ) : (
        <>
          <CustomToolBar toolbarConfigs={toolbarConfigs} />
          <EmptyCard
            wrapperClass={`page-empty-card ${classes.emptyWrapper}`}
            icon={<CollectionIcon />}
            text={t('noData')}
          />
        </>
      )}
    </section>
  );
};

export default Collections;
