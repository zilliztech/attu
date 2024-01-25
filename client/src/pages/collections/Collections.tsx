import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { makeStyles, Theme, Chip, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Highlighter from 'react-highlight-words';
import {
  rootContext,
  authContext,
  dataContext,
  webSocketContext,
} from '@/context';
import { Collection, MilvusService, MilvusIndex } from '@/http';
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
import DuplicateCollectionDialog from '../dialogs/DuplicateCollectionDailog';
import InsertDialog from '../dialogs/insert/Dialog';
import ImportSampleDialog from '../dialogs/ImportSampleDialog';
import { LOADING_STATE } from '@/consts';
import { WS_EVENTS, WS_EVENTS_TYPE } from '@server/utils/Const';
import { checkIndexBuilding, checkLoading } from '@/utils';
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
  const { database } = useContext(dataContext);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState<string>(
    (searchParams.get('search') as string) || ''
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>(
    []
  );

  const { setDialog, openSnackBar } = useContext(rootContext);
  const { collections, setCollections } = useContext(webSocketContext);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: successTrans } = useTranslation('success');
  const classes = useStyles();

  const InfoIcon = icons.info;
  const SourceIcon = icons.source;

  const consistencyTooltipsMap: Record<string, string> = {
    Strong: collectionTrans('consistencyStrongTooltip'),
    Bounded: collectionTrans('consistencyBoundedTooltip'),
    Session: collectionTrans('consistencySessionTooltip'),
    Eventually: collectionTrans('consistencyEventuallyTooltip'),
  };

  const checkCollectionStatus = useCallback((collections: Collection[]) => {
    const hasLoadingOrBuildingCollection = collections.some(
      v => checkLoading(v) || checkIndexBuilding(v)
    );

    // if some collection is building index or loading, start pulling data
    if (hasLoadingOrBuildingCollection) {
      MilvusService.triggerCron({
        name: WS_EVENTS.COLLECTION,
        type: WS_EVENTS_TYPE.START,
      });
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const collections = await Collection.getCollections();
      setCollections(collections);
      checkCollectionStatus(collections);
    } finally {
      setLoading(false);
    }
  }, [setCollections, checkCollectionStatus]);

  const clearIndexCache = useCallback(async () => {
    await MilvusIndex.flush();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, database]);

  const getVectorField = (collection: Collection) => {
    return collection.fieldWithIndexInfo!.find(
      d => d.fieldType === 'FloatVector' || d.fieldType === 'BinaryVector'
    );
  };

  const formatCollections = useMemo(() => {
    const filteredCollections = search
      ? collections.filter(collection =>
          collection.collectionName.includes(search)
        )
      : collections;

    const data = filteredCollections.map(v => {
      // const indexStatus = statusRes.find(item => item.collectionName === v.collectionName);
      Object.assign(v, {
        nameElement: (
          <Link
            to={`/collections/${v.collectionName}/data`}
            className={classes.link}
            title={v.collectionName}
          >
            <Highlighter
              textToHighlight={v.collectionName}
              searchWords={[search]}
              highlightClassName={classes.highlight}
            />
          </Link>
        ),
        features: (
          <>
            {v.autoID ? (
              <Tooltip
                title={collectionTrans('autoIDTooltip')}
                placement="top"
                arrow
              >
                <Chip
                  className={classes.chip}
                  label={collectionTrans('autoID')}
                  size="small"
                />
              </Tooltip>
            ) : null}
            {v.enableDynamicField ? (
              <Tooltip
                title={collectionTrans('dynamicSchemaTooltip')}
                placement="top"
                arrow
              >
                <Chip
                  className={classes.chip}
                  label={collectionTrans('dynmaicSchema')}
                  size="small"
                />
              </Tooltip>
            ) : null}
            <Tooltip
              title={consistencyTooltipsMap[v.consistency_level]}
              placement="top"
              arrow
            >
              <Chip
                className={classes.chip}
                label={v.consistency_level}
                size="small"
              />
            </Tooltip>
          </>
        ),
        statusElement: (
          <StatusAction
            status={v.status}
            onIndexCreate={fetchData}
            percentage={v.loadedPercentage}
            field={getVectorField(v)!}
            collectionName={v.collectionName}
            action={() => {
              setDialog({
                open: true,
                type: 'custom',
                params: {
                  component:
                    v.status === LOADING_STATE.UNLOADED ? (
                      <LoadCollectionDialog
                        collection={v.collectionName}
                        onLoad={async () => {
                          openSnackBar(
                            successTrans('load', {
                              name: collectionTrans('collection'),
                            })
                          );
                          await fetchData();
                        }}
                      />
                    ) : (
                      <ReleaseCollectionDialog
                        collection={v.collectionName}
                        onRelease={async () => {
                          openSnackBar(
                            successTrans('release', {
                              name: collectionTrans('collection'),
                            })
                          );
                          await fetchData();
                        }}
                      />
                    ),
                },
              });
            }}
          />
        ),
        _aliasElement: (
          <Aliases
            aliases={v.aliases}
            collectionName={v.collectionName}
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

  const toolbarConfigs: ToolBarConfig[] = [
    {
      label: collectionTrans('create'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <CreateCollectionDialog
                onCreate={async () => {
                  openSnackBar(
                    successTrans('create', {
                      name: collectionTrans('collection'),
                    })
                  );
                  await fetchData();
                }}
              />
            ),
          },
        });
      },
      icon: 'add',
    },
    {
      icon: 'uploadFile',
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      label: btnTrans('importFile'),
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
                    ? selectedCollections[0].collectionName
                    : ''
                }
                // user can't select partition on collection page, so default value is ''
                defaultSelectedPartition={''}
                onInsert={() => {}}
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
                  openSnackBar(
                    successTrans('rename', {
                      name: collectionTrans('collection'),
                    })
                  );
                  await fetchData();
                  setSelectedCollections([]);
                }}
                collectionName={selectedCollections[0].collectionName}
              />
            ),
          },
        });
      },
      label: btnTrans('rename'),
      // tooltip: collectionTrans('deleteTooltip'),
      disabledTooltip: collectionTrans('renameTooltip'),
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
                  openSnackBar(
                    successTrans('duplicate', {
                      name: collectionTrans('collection'),
                    })
                  );
                  setSelectedCollections([]);
                  await fetchData();
                }}
                collectionName={selectedCollections[0].collectionName}
                collections={collections}
              />
            ),
          },
        });
      },
      label: btnTrans('duplicate'),
      // tooltip: collectionTrans('deleteTooltip'),
      disabledTooltip: collectionTrans('duplicateTooltip'),
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
                  openSnackBar(
                    successTrans('delete', {
                      name: collectionTrans('collection'),
                    })
                  );
                  await fetchData();
                  setSelectedCollections([]);
                }}
                collections={selectedCollections}
              />
            ),
          },
        });
      },
      label: btnTrans('drop'),
      // tooltip: collectionTrans('deleteTooltip'),
      disabledTooltip: collectionTrans('deleteTooltip'),
      disabled: data => data.length < 1,
    },

    {
      icon: 'refresh',
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        clearIndexCache();
        fetchData();
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
      id: 'nameElement',
      align: 'left',
      disablePadding: true,
      sortBy: 'collectionName',
      label: collectionTrans('name'),
    },
    {
      id: 'statusElement',
      align: 'left',
      disablePadding: false,
      sortBy: 'status',
      label: collectionTrans('status'),
    },
    {
      id: 'features',
      align: 'left',
      disablePadding: true,
      sortBy: 'enableDynamicField',
      label: collectionTrans('features'),
    },
    {
      id: 'entityCount',
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
      id: 'desc',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('desc'),
    },
    {
      id: 'createdAt',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('createdTime'),
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
          onClick: (e: React.MouseEvent, row: Collection) => {
            setDialog({
              open: true,
              type: 'custom',
              params: {
                component: (
                  <ImportSampleDialog collection={row.collectionName} />
                ),
              },
            });
          },
          icon: 'source',
          label: 'Import',
          showIconMethod: 'renderFn',
          getLabel: () => 'Import sample data',
          renderIconFn: (row: Collection) => <SourceIcon />,
        },
      ],
    },
  ];

  if (!isManaged) {
    colDefinitions.splice(4, 0, {
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
    <section className="page-wrapper">
      {collections.length > 0 || loading ? (
        <AttuGrid
          toolbarConfigs={toolbarConfigs}
          colDefinitions={colDefinitions}
          rows={collectionList}
          rowCount={total}
          primaryKey="collectionName"
          selected={selectedCollections}
          setSelected={handleSelectChange}
          page={currentPage}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          setRowsPerPage={handlePageSize}
          isLoading={loading}
          handleSort={handleGridSort}
          order={order}
          orderBy={orderBy}
          hideOnDisable={true}
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
