import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import MilvusGrid from '../../components/grid/Grid';
import CustomToolBar from '../../components/grid/ToolBar';
import {
  CollectionCreateParam,
  CollectionView,
  DataTypeEnum,
  InsertDataParam,
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
import CreateCollection from './Create';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import { CollectionHttp } from '../../http/Collection';
import {
  useInsertDialogHook,
  useLoadAndReleaseDialogHook,
} from '../../hooks/Dialog';
import Highlighter from 'react-highlight-words';
import { parseLocationSearch } from '../../utils/Format';
import InsertContainer from '../../components/insert/Container';
import { MilvusHttp } from '../../http/Milvus';
import { LOADING_STATE } from '../../consts/Milvus';
import { webSokcetContext } from '../../context/WebSocket';
import { WS_EVENTS, WS_EVENTS_TYPE } from '../../consts/Http';
import { checkIndexBuilding, checkLoading } from '../../utils/Validation';

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

let timer: NodeJS.Timeout | null = null;
// get init search value from url
const { urlSearch = '' } = parseLocationSearch(window.location.search);

const Collections = () => {
  useNavigationHook(ALL_ROUTER_TYPES.COLLECTIONS);
  const { handleAction } = useLoadAndReleaseDialogHook({ type: 'collection' });
  const { handleInsertDialog } = useInsertDialogHook();

  const [search, setSearch] = useState<string>(urlSearch);
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

  const searchedCollections = useMemo(
    () => collections.filter(collection => collection._name.includes(search)),
    [collections, search]
  );

  const formatCollections = useMemo(() => {
    const data = searchedCollections.map(v => {
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
      });

      return v;
    });
    return data;
  }, [classes.highlight, classes.link, search, searchedCollections]);

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

  const handleCreateCollection = async (param: CollectionCreateParam) => {
    const data: CollectionCreateParam = JSON.parse(JSON.stringify(param));
    const vectorType = [DataTypeEnum.BinaryVector, DataTypeEnum.FloatVector];

    data.fields = data.fields.map(v =>
      vectorType.includes(v.data_type)
        ? {
            ...v,
            type_params: {
              // if data type is vector, dimension must exist.
              dim: v.dimension!,
            },
          }
        : v
    );
    await CollectionHttp.createCollection(data);
    handleCloseDialog();
    openSnackBar(
      successTrans('create', { name: collectionTrans('collection') })
    );
    fetchData();
  };

  const handleRelease = async (data: CollectionView) => {
    const res = await CollectionHttp.releaseCollection(data._name);
    openSnackBar(
      successTrans('release', { name: collectionTrans('collection') })
    );
    fetchData();
    return res;
  };

  const handleLoad = async (data: CollectionView) => {
    const res = await CollectionHttp.loadCollection(data._name);
    openSnackBar(successTrans('load', { name: collectionTrans('collection') }));
    fetchData();
    return res;
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
    if (timer) {
      clearTimeout(timer);
    }
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
            component: (
              <CreateCollection handleCreate={handleCreateCollection} />
            ),
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
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <DeleteTemplate
                label={btnTrans('delete')}
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
          <CustomToolTip title={collectionTrans('tooltip')}>
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
            const cb =
              row._status === LOADING_STATE.UNLOADED
                ? handleLoad
                : handleRelease;
            handleAction(row, cb);
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
