import { Theme } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import Highlighter from 'react-highlight-words';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook, useInsertDialogHook } from '@/hooks';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { rootContext } from '@/context';
import { CollectionService, PartitionService } from '@/http';
import InsertContainer from '@/pages/dialogs/insert/Dialog';
import CreatePartitionDialog from '@/pages/dialogs/CreatePartitionDialog';
import DropPartitionDialog from '@/pages/dialogs/DropPartitionDialog';
import { formatNumber } from '@/utils';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { makeStyles } from '@mui/styles';
import type { PartitionData } from '@server/types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `100%`,
  },
  icon: {
    fontSize: '14px',
    marginLeft: theme.spacing(0.5),
  },
  highlight: {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
}));

const Partitions = () => {
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const classes = useStyles();
  const { t } = useTranslation('partition');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState<string>(
    (searchParams.get('search') as string) || ''
  );

  const { handleInsertDialog } = useInsertDialogHook();

  const [selectedPartitions, setSelectedPartitions] = useState<PartitionData[]>(
    []
  );
  const [partitions, setPartitions] = useState<PartitionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { setDialog, openSnackBar } = useContext(rootContext);

  const fetchPartitions = async (collectionName: string) => {
    try {
      const res = await PartitionService.getPartitions(collectionName);
      setLoading(false);
      setPartitions(res);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchCollectionDetail = async (name: string) => {
    const res = await CollectionService.getCollection(name);
    return res;
  };

  useEffect(() => {
    fetchPartitions(collectionName);
  }, [collectionName]);

  const list = search
    ? partitions.filter(p => p.name.includes(search))
    : partitions;

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data: partitionList,
    order,
    orderBy,
    handleGridSort,
  } = usePaginationHook(list);

  // on delete
  const onDelete = () => {
    openSnackBar(successTrans('delete', { name: t('partition') }));
    fetchPartitions(collectionName);
  };

  // on handle search
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      btnVariant: 'text',
      label: t('create'),
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <CreatePartitionDialog
                collectionName={collectionName}
                onCreate={onCreate}
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
      label: btnTrans('importFile'),
      icon: 'uploadFile',
      onClick: async () => {
        const collection = await fetchCollectionDetail(collectionName);
        const schema = collection.schema;

        handleInsertDialog(
          <InsertContainer
            schema={schema}
            defaultSelectedCollection={collectionName}
            defaultSelectedPartition={
              selectedPartitions.length === 1 ? selectedPartitions[0].name : ''
            }
            partitions={partitions}
            onInsert={async () => {
              await fetchPartitions(collectionName);
            }}
          />
        );
      },
      /**
       * insert validation:
       * 1. At least 1 available partition
       * 2. selected partition quantity shouldn't over 1
       */
      disabled: () => partitions.length === 0 || selectedPartitions.length > 1,
    },
    {
      icon: 'delete',
      type: 'button',
      btnVariant: 'text',
      btnColor: 'secondary',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <DropPartitionDialog
                partitions={selectedPartitions}
                collectionName={collectionName}
                onDelete={onDelete}
              />
            ),
          },
        });
      },
      label: btnTrans('drop'),
      // can't delete default partition
      disabled: () =>
        selectedPartitions.length === 0 ||
        selectedPartitions.some(p => p.name === '_default'),
      tooltip: selectedPartitions.some(p => p.name === '_default')
        ? t('deletePartitionError')
        : '',
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
      id: 'id',
      align: 'left',
      needCopy: true,
      disablePadding: false,
      label: t('id'),
      getStyle: () => {
        return {
          width: 120,
        };
      },
    },
    {
      id: 'name',
      sortType: 'string',
      align: 'left',
      disablePadding: true,
      sortBy: 'name',
      formatter({ name }) {
        const newName = name === '_default' ? 'Default partition' : name;
        return (
          <Highlighter
            textToHighlight={newName}
            searchWords={[search]}
            highlightClassName={classes.highlight}
          />
        );
      },
      label: t('name'),
    },

    {
      id: 'rowCount',
      align: 'left',
      disablePadding: false,
      label: (
        <span className="flex-center with-max-content">
          {t('rowCount')}
          <CustomToolTip title={t('tooltip')}>
            <Icons.question classes={{ root: classes.icon }} />
          </CustomToolTip>
        </span>
      ),
      formatter(data) {
        return formatNumber(Number(data.rowCount));
      },
    },
    // {
    //   id: 'action',
    //   align: 'center',
    //   disablePadding: false,
    //   label: '',
    //   showActionCell: true,
    //   isHoverAction: true,
    //   actionBarConfigs: [
    //     {
    //       onClick: (e: React.MouseEvent, row: PartitionView) => {
    //         const cb =
    //           row._status === StatusEnum.unloaded ? handleLoad : handleRelease;
    //         handleAction(row, cb);
    //       },
    //       icon: 'load',
    //       label: 'load',
    //       showIconMethod: 'renderFn',
    //       getLabel: (row: PartitionView) =>
    //         row._status === StatusEnum.loaded ? 'release' : 'load',
    //       renderIconFn: (row: PartitionView) =>
    //         row._status === StatusEnum.loaded ? <ReleaseIcon /> : <LoadIcon />,
    //     },
    //   ],
    // },
    {
      id: 'createdTime',
      align: 'left',
      disablePadding: false,
      formatter(data) {
        return new Date(Number(data.createdTime)).toLocaleString();
      },
      label: t('createdTime'),
    },
  ];

  const handleSelectChange = (value: PartitionData[]) => {
    setSelectedPartitions(value);
  };

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
    setSelectedPartitions([]);
  };

  const onCreate = () => {
    openSnackBar(successTrans('create', { name: t('partition') }));
    // refresh partitions
    fetchPartitions(collectionName);
    setSelectedPartitions([]);
  };

  return (
    <section className={classes.wrapper}>
      <AttuGrid
        toolbarConfigs={toolbarConfigs}
        colDefinitions={colDefinitions}
        rows={partitionList}
        rowCount={total}
        primaryKey="id"
        selected={selectedPartitions}
        setSelected={handleSelectChange}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        isLoading={loading}
        order={order}
        orderBy={orderBy}
        handleSort={handleGridSort}
        labelDisplayedRows={getLabelDisplayedRows(
          gridTrans[partitionList.length > 1 ? 'partitions' : 'partition']
        )}
      />
    </section>
  );
};

export default Partitions;
