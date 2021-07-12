import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import MilvusGrid from '../../components/grid/Grid';
import CustomToolBar from '../../components/grid/ToolBar';
import { CollectionCreateParam, CollectionView, DataTypeEnum } from './Types';
import { ColDefinitionsType, ToolBarConfig } from '../../components/grid/Types';
import { usePaginationHook } from '../../hooks/Pagination';
import icons from '../../components/icons/Icons';
import EmptyCard from '../../components/cards/EmptyCard';
import Status from '../../components/status/Status';
import { useTranslation } from 'react-i18next';
import { ChildrenStatusType, StatusEnum } from '../../components/status/Types';
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
const { search = '' } = parseLocationSearch(window.location.search);

const Collections = () => {
  useNavigationHook(ALL_ROUTER_TYPES.COLLECTIONS);
  const { handleAction } = useLoadAndReleaseDialogHook({ type: 'collection' });
  const { handleInsertDialog } = useInsertDialogHook();
  const [collections, setCollections] = useState<CollectionView[]>([]);
  const [searchedCollections, setSearchedCollections] = useState<
    CollectionView[]
  >([]);
  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: collectionList,
  } = usePaginationHook(searchedCollections);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCollections, setSelectedCollections] = useState<
    CollectionView[]
  >([]);

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');

  const classes = useStyles();

  const LoadIcon = icons.load;
  const ReleaseIcon = icons.release;
  const InfoIcon = icons.info;

  const fetchData = useCallback(async () => {
    try {
      const res = await CollectionHttp.getCollections();
      const statusRes = await CollectionHttp.getCollectionsIndexState();
      setLoading(false);

      const collections = res.map(v => {
        const indexStatus = statusRes.find(item => item._name === v._name);
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
          statusElement: <Status status={v._status} />,
          indexCreatingElement: (
            <StatusIcon
              type={indexStatus?._indexState || ChildrenStatusType.FINISH}
            />
          ),
        });

        return v;
      });

      // filter collection if url contains search param
      const filteredCollections = collections.filter(collection =>
        collection._name.includes(search)
      );

      setCollections(collections);
      setSearchedCollections(filteredCollections);
    } catch (err) {
      setLoading(false);
    }
  }, [classes.link, classes.highlight]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCollection = async (param: CollectionCreateParam) => {
    const data: CollectionCreateParam = JSON.parse(JSON.stringify(param));
    const vectorType = [DataTypeEnum.BinaryVector, DataTypeEnum.FloatVector];

    data.fields = data.fields.map(v =>
      vectorType.includes(v.data_type)
        ? {
            ...v,
            type_params: [{ key: 'dim', value: v.dimension }],
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
    // add loading manually
    setLoading(true);
    timer = setTimeout(() => {
      const searchWords = [value];
      const list = value
        ? collections.filter(c => c._name.includes(value))
        : collections;

      const highlightList = list.map(c => {
        Object.assign(c, {
          nameElement: (
            <Link to={`/collections/${c._name}`} className={classes.link}>
              <Highlighter
                textToHighlight={c._name}
                searchWords={searchWords}
                highlightClassName={classes.highlight}
              />
            </Link>
          ),
        });
        return c;
      });

      setLoading(false);
      setSearchedCollections(highlightList);
    }, 300);
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
        const component = (
          <InsertContainer
            collections={[]}
            selectedCollection={''}
            partitions={[]}
            selectedPartition={''}
            schema={[]}
            handleInsert={() => {}}
          />
        );
        handleInsertDialog(component);
      },
      /**
       * insert validation:
       * 1. At least 1 available collection
       * 2. selected collections quantity shouldn't over 1
       */
      disabled: () =>
        collectionList.length === 0 || selectedCollections.length > 1,
      icon: 'upload',
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
      id: '_id',
      align: 'left',
      disablePadding: true,
      label: collectionTrans('id'),
    },
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
              row._status === StatusEnum.unloaded ? handleLoad : handleRelease;
            handleAction(row, cb);
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
          rows={collectionList}
          rowCount={total}
          primaryKey="_name"
          openCheckBox={true}
          showHoverStyle={true}
          selected={selectedCollections}
          setSelected={handleSelectChange}
          page={currentPage}
          onChangePage={handlePageChange}
          rowsPerPage={pageSize}
          setRowsPerPage={handlePageSize}
          isLoading={loading}
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
