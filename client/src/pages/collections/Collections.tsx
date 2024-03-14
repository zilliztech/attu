import { useCallback, useContext, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { makeStyles, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Highlighter from 'react-highlight-words';
import { rootContext, authContext, dataContext } from '@/context';
import { CollectionService } from '@/http';
import { useNavigationHook, usePaginationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import AttuGrid from '@/components/grid/Grid';
import CustomToolBar from '@/components/grid/ToolBar';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import icons from '@/components/icons/Icons';
import EmptyCard from '@/components/cards/EmptyCard';
import StatusAction from '@/pages/collections/StatusAction';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import CreateCollectionDialog from '../dialogs/CreateCollectionDialog';
import LoadCollectionDialog from '../dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '../dialogs/ReleaseCollectionDialog';
import DropCollectionDialog from '../dialogs/DropCollectionDialog';
import RenameCollectionDialog from '../dialogs/RenameCollectionDialog';
import DuplicateCollectionDialog from '../dialogs/DuplicateCollectionDialog';
import InsertDialog from '../dialogs/insert/Dialog';
import ImportSampleDialog from '../dialogs/ImportSampleDialog';
import { getLabelDisplayedRows } from '../search/Utils';
import { LOADING_STATE } from '@/consts';
import { formatNumber } from '@/utils';
import Aliases from './Aliases';
import { CollectionObject } from '@server/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: `100%`,
  },
  emptyWrapper: {
    marginTop: theme.spacing(2),
  },

  icon: {
    fontSize: '14px',
    marginLeft: theme.spacing(0.5),
  },

  dialogContent: {
    lineHeight: '24px',
    fontSize: '16px',
  },
  link: {
    color: theme.palette.common.black,
    display: 'inline-block',
    wordBreak: 'break-all',
    whiteSpace: 'nowrap',
    width: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: '20px',
  },
  highlight: {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
  chip: {
    color: theme.palette.text.primary,
    marginRight: theme.spacing(0.5),
    background: `rgba(0, 0, 0, 0.04)`,
  },
}));

const Collections = () => {
  useNavigationHook(ALL_ROUTER_TYPES.COLLECTIONS);
  const { isManaged } = useContext(authContext);
  const { collections, database, loading, fetchCollections, fetchCollection } =
    useContext(dataContext);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState<string>(
    (searchParams.get('search') as string) || ''
  );
  const [selectedCollections, setSelectedCollections] = useState<
    CollectionObject[]
  >([]);

  const { setDialog } = useContext(rootContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const classes = useStyles();

  const QuestionIcon = icons.question;
  const SourceIcon = icons.source;

  const clearIndexCache = useCallback(async () => {
    await CollectionService.flush();
  }, []);

  const formatCollections = useMemo(() => {
    const filteredCollections = search
      ? collections.filter(collection =>
          collection.collection_name.includes(search)
        )
      : collections;

    return filteredCollections;
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

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: collectionTrans('create'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: <CreateCollectionDialog />,
          },
        });
      },
      icon: 'add',
    },
    {
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      label: btnTrans('load'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <LoadCollectionDialog
                collection={selectedCollections[0]}
                onLoad={async () => {
                  setSelectedCollections([]);
                }}
              />
            ),
          },
        });
      },
      icon: 'load',
      disabled: data => {
        return (
          data.length !== 1 ||
          data[0].status !== LOADING_STATE.UNLOADED ||
          !data[0].schema.hasVectorIndex
        );
      },
      tooltip: btnTrans('loadColTooltip'),
    },
    {
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      label: btnTrans('release'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <ReleaseCollectionDialog
                collection={selectedCollections[0]}
                onRelease={async () => {
                  setSelectedCollections([]);
                }}
              />
            ),
          },
        });
      },
      icon: 'release',
      tooltip: btnTrans('releaseColTooltip'),
      disabled: data => {
        return data.length !== 1 || data[0].status !== LOADING_STATE.LOADED;
      },
    },
    {
      icon: 'uploadFile',
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      label: btnTrans('importFile'),
      tooltip: btnTrans('importFileTooltip'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <InsertDialog
                collections={formatCollections}
                defaultSelectedCollection={
                  selectedCollections.length === 1
                    ? selectedCollections[0].collection_name
                    : ''
                }
                // user can't select partition on collection page, so default value is ''
                defaultSelectedPartition={''}
                onInsert={async (collectionName: string) => {
                  await fetchCollection(collectionName);
                  setSelectedCollections([]);
                }}
              />
            ),
          },
        });
      },
      /**
       * insert validation:
       * 1. At least 1 available collection
       * 2. selected collections quantity shouldn't over 1
       */
      disabled: () =>
        collectionList.length === 0 || selectedCollections.length > 1,
    },
    {
      icon: 'edit',
      type: 'button',
      btnColor: 'secondary',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <RenameCollectionDialog
                cb={async () => {
                  setSelectedCollections([]);
                }}
                collection={selectedCollections[0]}
              />
            ),
          },
        });
      },
      label: btnTrans('rename'),
      tooltip: btnTrans('renameTooltip'),
      disabled: data => data.length !== 1,
    },
    {
      icon: 'copy',
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <DuplicateCollectionDialog
                cb={async () => {
                  setSelectedCollections([]);
                }}
                collection={selectedCollections[0]}
                collections={collections}
              />
            ),
          },
        });
      },
      label: btnTrans('duplicate'),
      tooltip: btnTrans('duplicateTooltip'),
      disabled: data => data.length !== 1,
    },
    {
      icon: 'delete',
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <DropCollectionDialog
                onDelete={async () => {
                  setSelectedCollections([]);
                }}
                collections={selectedCollections}
              />
            ),
          },
        });
      },
      label: btnTrans('drop'),
      tooltip: btnTrans('deleteColTooltip'),
      disabledTooltip: btnTrans('deleteDisableTooltip'),
      disabled: data => data.length < 1,
    },

    {
      icon: 'refresh',
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        clearIndexCache();
        fetchCollections();
      },
      disabled: () => {
        return loading;
      },
      label: btnTrans('refresh'),
    },

    {
      label: 'Search',
      icon: 'search',
      searchText: search,
      onSearch: (value: string) => {
        setSearch(value);
      },
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'collection_name',
      align: 'left',
      disablePadding: true,
      sortBy: 'collection_name',
      formatter({ collection_name }) {
        return (
          <Link
            to={`/databases/${database}/${collection_name}/info`}
            className={classes.link}
            title={collection_name}
          >
            <Highlighter
              textToHighlight={collection_name}
              searchWords={[search]}
              highlightClassName={classes.highlight}
            />
          </Link>
        );
      },
      label: collectionTrans('name'),
    },
    {
      id: 'status',
      align: 'left',
      disablePadding: false,
      sortBy: 'loadedPercentage',
      label: collectionTrans('status'),
      formatter(v) {
        return (
          <StatusAction
            status={v.status}
            percentage={v.loadedPercentage}
            schema={v.schema}
            action={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component:
                    v.status === LOADING_STATE.UNLOADED ? (
                      <LoadCollectionDialog collection={v} />
                    ) : (
                      <ReleaseCollectionDialog collection={v} />
                    ),
                },
              });
            }}
          />
        );
      },
    },
    {
      id: 'rowCount',
      align: 'left',
      disablePadding: false,
      sortBy: 'rowCount',
      label: (
        <span className="flex-center with-max-content">
          {collectionTrans('rowCount')}
          <CustomToolTip title={collectionTrans('entityCountInfo')}>
            <QuestionIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
      formatter(v) {
        return formatNumber(v.rowCount);
      },
    },
    {
      id: 'description',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center with-max-content">
          {collectionTrans('description')}
        </span>
      ),
      formatter(v) {
        return v.description || '--';
      },
    },
    {
      id: 'createdTime',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('createdTime'),
      formatter(data) {
        return new Date(data.createdTime).toLocaleString();
      },
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
          onClick: (e: React.MouseEvent, row: CollectionObject) => {
            setDialog({
              open: true,
              type: 'custom',
              params: {
                component: (
                  <ImportSampleDialog
                    collection={row}
                    cb={async (collectionName: string) => {
                      setTimeout(async () => {
                        await fetchCollection(collectionName);
                      });
                    }}
                  />
                ),
              },
            });
          },
          icon: 'source',
          label: 'Import',
          showIconMethod: 'renderFn',
          getLabel: () => 'Import sample data',
          renderIconFn: () => <SourceIcon />,
        },
      ],
    },
  ];

  if (!isManaged) {
    colDefinitions.splice(4, 0, {
      id: 'aliases',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center with-max-content">
          {collectionTrans('alias')}
          <CustomToolTip title={collectionTrans('aliasInfo')}>
            <QuestionIcon classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
      formatter(v) {
        return <Aliases aliases={v.aliases} collection={v} />;
      },
    });
  }

  const handleSelectChange = (value: any) => {
    setSelectedCollections(value);
  };

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
    setSelectedCollections([]);
  };

  const CollectionIcon = icons.navCollection;

  return (
    <section className={classes.root}>
      {collections.length > 0 || loading ? (
        <AttuGrid
          toolbarConfigs={toolbarConfigs}
          colDefinitions={colDefinitions}
          rows={collectionList}
          rowCount={total}
          primaryKey="id"
          selected={selectedCollections}
          setSelected={handleSelectChange}
          page={currentPage}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          tableHeaderHeight={49}
          rowHeight={49}
          setRowsPerPage={handlePageSize}
          isLoading={loading}
          handleSort={handleGridSort}
          order={order}
          orderBy={orderBy}
          hideOnDisable={true}
          labelDisplayedRows={getLabelDisplayedRows(gridTrans.collections)}
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
