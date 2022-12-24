import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import AttuGrid from '../../components/grid/Grid';
import CustomToolBar from '../../components/grid/ToolBar';
import {
  CollectionCreateParam,
  CollectionView,
  DataTypeEnum,
  InsertDataParam,
  LoadSampleParam,
} from './Types';
import { ColDefinitionsType, ToolBarConfig } from '../../components/grid/Types';
import { usePaginationHook } from '../../hooks/Pagination';
import icons from '../../components/icons/Icons';
import EmptyCard from '../../components/cards/EmptyCard';
import Status from '../../components/status/Status';
import { useTranslation } from 'react-i18next';
import { ChildrenStatusType } from '../../components/status/Types';
import { makeStyles, Theme } from '@material-ui/core';
import StatusIcon from '../../components/status/StatusIcon';
import CustomToolTip from '../../components/customToolTip/CustomToolTip';
import { rootContext } from '../../context/Root';
import CreateCollectionDialog from '../dialogs/CreateCollectionDialog';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import { CollectionHttp } from '../../http/Collection';
import { useInsertDialogHook } from '../../hooks/Dialog';
import LoadCollectionDialog from '../dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '../dialogs/ReleaseCollectionDialog';
import Highlighter from 'react-highlight-words';
import InsertContainer from '../../components/insert/Container';
import ImportSample from '../../components/insert/ImportSample';
import { MilvusHttp } from '../../http/Milvus';
import { LOADING_STATE } from '../../consts/Milvus';
import { webSokcetContext } from '../../context/WebSocket';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../../consts/Http';
import { checkIndexBuilding, checkLoading } from '../../utils/Validation';
import Aliases from './Aliases';

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
  link: {
    color: theme.palette.common.black,
  },
  highlight: {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
}));

const Collections = () => {
  useNavigationHook(ALL_ROUTER_TYPES.COLLECTIONS);
  const { handleInsertDialog } = useInsertDialogHook();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState<string>(
    (searchParams.get('search') as string) || ''
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCollections, setSelectedCollections] = useState<
    CollectionView[]
  >([]);

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { collections, setCollections } = useContext(webSokcetContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const classes = useStyles();

  const LoadIcon = icons.load;
  const ReleaseIcon = icons.release;
  const InfoIcon = icons.info;
  const SourceIcon = icons.source;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await CollectionHttp.getCollections();
      const hasLoadingOrBuildingCollection = res.some(
        v => checkLoading(v) || checkIndexBuilding(v)
      );

      // if some collection is building index or loading, start pulling data
      if (hasLoadingOrBuildingCollection) {
        MilvusHttp.triggerCron({
          name: WS_EVENTS.COLLECTION,
          type: WS_EVENTS_TYPE.START,
        });
      }

      setCollections(res);
    } finally {
      setLoading(false);
    }
  }, [setCollections]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCollections = useMemo(() => {
    const filteredCollections = search
      ? collections.filter(collection => collection._name.includes(search))
      : collections;

    const data = filteredCollections.map(v => {
      // const indexStatus = statusRes.find(item => item._name === v._name);
      Object.assign(v, {
        nameElement: (
          <Link to={`/collections/${v._name}`} className={classes.link}>
            <Highlighter
              textToHighlight={v._name}
              searchWords={[search]}
              highlightClassName={classes.highlight}
            />
          </Link>
        ),
        statusElement: (
          <Status status={v._status} percentage={v._loadedPercentage} />
        ),
        indexCreatingElement: (
          <StatusIcon type={v._indexState || ChildrenStatusType.FINISH} />
        ),
        _aliasElement: (
          <Aliases
            aliases={v._aliases}
            collectionName={v._name}
            onCreate={fetchData}
            onDelete={fetchData}
          />
        ),
      });
      return v;
    });

    return data;
  }, [search, collections]);

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: collectionList,
    handleGridSort,
    order,
    orderBy,
  } = usePaginationHook(formatCollections);

  const handleInsert = async (
    collectionName: string,
    partitionName: string,
    fieldData: any[]
  ): Promise<{ result: boolean; msg: string }> => {
    const param: InsertDataParam = {
      partition_names: [partitionName],
      fields_data: fieldData,
    };
    try {
      await CollectionHttp.insertData(collectionName, param);
      await MilvusHttp.flush(collectionName);
      // update collections
      fetchData();
      return { result: true, msg: '' };
    } catch (err: any) {
      const {
        response: {
          data: { message },
        },
      } = err;
      return { result: false, msg: message || '' };
    }
  };

  const handleImportSample = async (
    collectionName: string,
    size: string
  ): Promise<{ result: boolean; msg: string }> => {
    const param: LoadSampleParam = {
      collection_name: collectionName,
      size: size,
    };
    try {
      await CollectionHttp.importSample(collectionName, param);
      await MilvusHttp.flush(collectionName);
      return { result: true, msg: '' };
    } catch (err: any) {
      const {
        response: {
          data: { message },
        },
      } = err;
      return { result: false, msg: message || '' };
    }
  };

  const onCreate = () => {
    handleCloseDialog();
    openSnackBar(
      successTrans('create', { name: collectionTrans('collection') })
    );
    fetchData();
  };

  const onRelease = async () => {
    openSnackBar(
      successTrans('release', { name: collectionTrans('collection') })
    );
    fetchData();
  };

  const onLoad = () => {
    openSnackBar(successTrans('load', { name: collectionTrans('collection') }));
    fetchData();
  };

  const handleDelete = async () => {
    for (const item of selectedCollections) {
      await CollectionHttp.deleteCollection(item._name);
    }
    openSnackBar(
      successTrans('delete', { name: collectionTrans('collection') })
    );
    fetchData();
    handleCloseDialog();
    setSelectedCollections([]);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: collectionTrans('create'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: <CreateCollectionDialog onCreate={onCreate} />,
          },
        });
      },
      icon: 'add',
    },
    {
      label: btnTrans('insert'),
      onClick: () => {
        handleInsertDialog(
          <InsertContainer
            collections={formatCollections}
            defaultSelectedCollection={
              selectedCollections.length === 1
                ? selectedCollections[0]._name
                : ''
            }
            // user can't select partition on collection page, so default value is ''
            defaultSelectedPartition={''}
            handleInsert={handleInsert}
          />
        );
      },
      /**
       * insert validation:
       * 1. At least 1 available collection
       * 2. selected collections quantity shouldn't over 1
       */
      disabled: () =>
        collectionList.length === 0 || selectedCollections.length > 1,
      btnVariant: 'outlined',
    },
    {
      type: 'iconBtn',
      onClick: () => {
        fetchData();
      },
      label: collectionTrans('delete'),
      icon: 'refresh',
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
                label={btnTrans('drop')}
                title={dialogTrans('deleteTitle', {
                  type: collectionTrans('collection'),
                })}
                text={collectionTrans('deleteWarning')}
                handleDelete={handleDelete}
              />
            ),
          },
        });
      },
      label: collectionTrans('delete'),
      icon: 'delete',
      // tooltip: collectionTrans('deleteTooltip'),
      disabledTooltip: collectionTrans('deleteTooltip'),
      disabled: data => data.length === 0,
    },

    {
      label: 'Search',
      icon: 'search',
      searchText: search,
      onSearch: (value: string) => {
        handleSearch(value);
      },
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'nameElement',
      align: 'left',
      disablePadding: true,
      sortBy: '_name',
      label: collectionTrans('name'),
    },
    {
      id: 'statusElement',
      align: 'left',
      disablePadding: false,
      sortBy: '_status',
      label: collectionTrans('status'),
    },
    {
      id: '_rowCount',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center">
          {collectionTrans('rowCount')}
          <CustomToolTip title={collectionTrans('entityCountInfo')}>
            <InfoIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
    },
    {
      id: '_aliasElement',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center">
          {collectionTrans('alias')}
          <CustomToolTip title={collectionTrans('aliasInfo')}>
            <InfoIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
    },
    {
      id: 'consistency_level',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center">
          {collectionTrans('consistencyLevel')}
          <CustomToolTip title={collectionTrans('consistencyLevelInfo')}>
            <InfoIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
    },

    {
      id: '_desc',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('desc'),
    },
    {
      id: '_createdTime',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('createdTime'),
    },
    // {
    //   id: 'indexCreatingElement',
    //   align: 'left',
    //   disablePadding: false,
    //   label: '',
    // },
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
            setDialog({
              open: true,
              type: 'custom',
              params: {
                component:
                  row._status === LOADING_STATE.UNLOADED ? (
                    <LoadCollectionDialog
                      collection={row._name}
                      onLoad={onLoad}
                    />
                  ) : (
                    <ReleaseCollectionDialog
                      collection={row._name}
                      onRelease={onRelease}
                    />
                  ),
              },
            });

            e.preventDefault();
          },
          icon: 'load',
          label: 'load',
          showIconMethod: 'renderFn',
          getLabel: (row: CollectionView) =>
            row._status === LOADING_STATE.UNLOADED ? 'load' : 'release',
          renderIconFn: (row: CollectionView) =>
            row._status === LOADING_STATE.UNLOADED ? (
              <LoadIcon />
            ) : (
              <ReleaseIcon />
            ),
        },
      ],
    },
    {
      id: 'import',
      align: 'center',
      disablePadding: false,
      label: '',
      showActionCell: true,
      isHoverAction: true,
      actionBarConfigs: [
        {
          onClick: (e: React.MouseEvent, row: CollectionView) => {
            setDialog({
              open: true,
              type: 'custom',
              params: {
                component: (
                  <ImportSample
                    collection={row._name}
                    handleImport={handleImportSample}
                  />
                ),
              },
            });
          },
          icon: 'source',
          label: 'Import',
          showIconMethod: 'renderFn',
          getLabel: () => 'Import sample data',
          renderIconFn: (row: CollectionView) => <SourceIcon />,
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
        <AttuGrid
          toolbarConfigs={toolbarConfigs}
          colDefinitions={colDefinitions}
          rows={collectionList}
          rowCount={total}
          primaryKey="_name"
          selected={selectedCollections}
          setSelected={handleSelectChange}
          page={currentPage}
          onChangePage={handlePageChange}
          rowsPerPage={pageSize}
          setRowsPerPage={handlePageSize}
          isLoading={loading}
          handleSort={handleGridSort}
          order={order}
          orderBy={orderBy}
        />
      ) : (
        <>
          <CustomToolBar toolbarConfigs={toolbarConfigs} />
          <EmptyCard
            wrapperClass={`page-empty-card ${classes.emptyWrapper}`}
            icon={<CollectionIcon />}
            text={collectionTrans('noData')}
          />
        </>
      )}
    </section>
  );
};

export default Collections;
