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
import { makeStyles, Theme, Link } from '@material-ui/core';
import StatusIcon from '../../components/status/StatusIcon';
import CustomToolTip from '../../components/customToolTip/CustomToolTip';
import { rootContext } from '../../context/Root';
import CreateCollection from './Create';

const useStyles = makeStyles((theme: Theme) => ({
  emptyWrapper: {
    marginTop: theme.spacing(2),
  },

  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
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

  const classes = useStyles();

  const loading = false;

  const LoadIcon = icons.load;
  const ReleaseIcon = icons.release;
  const InfoIcon = icons.info;

  useEffect(() => {
    const mockCollections: CollectionView[] = [
      {
        name: 'collection',
        nameElement: (
          <Link href="/overview" underline="always" color="textPrimary">
            collection
          </Link>
        ),
        id: 'c1',
        status: StatusEnum.unloaded,
        statusElement: <Status status={StatusEnum.unloaded} />,
        rowCount: '200,000',
        desc: 'description',
        indexCreatingElement: <StatusIcon type="creating" />,
      },
      {
        name: 'collection 2',
        nameElement: (
          <Link href="/overview" underline="always" color="textPrimary">
            collection 2
          </Link>
        ),
        id: 'c2',
        status: StatusEnum.loaded,
        statusElement: <Status status={StatusEnum.loaded} />,
        rowCount: '300,000',
        desc: 'description 2',
        indexCreatingElement: <StatusIcon type="finish" />,
      },
    ];
    setCollections(mockCollections);
  }, []);

  const handleCreateCollection = (param: CollectionCreateParam) => {
    handleCloseDialog();
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
        console.log('delete collections');
      },
      label: t('delete'),
      icon: 'delete',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'id',
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
      id: 'rowCount',
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
      id: 'desc',
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
            console.log('action row', row);
          },
          icon: 'load',
          label: 'load',
          showIconMethod: 'renderFn',
          getLabel: (row: CollectionView) =>
            row.status === StatusEnum.loaded ? 'release' : 'load',
          renderIconFn: (row: CollectionView) =>
            row.status === StatusEnum.loaded ? <ReleaseIcon /> : <LoadIcon />,
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
