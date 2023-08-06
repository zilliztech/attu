import { makeStyles, Theme } from '@material-ui/core';
import { FC, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PartitionView } from './Types';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType, ToolBarConfig } from '@/components/grid/Types';
import { useTranslation } from 'react-i18next';
import { usePaginationHook } from '@/hooks/Pagination';
import icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import { rootContext } from '@/context';
import { PartitionHttp } from '@/http/Partition';
import Highlighter from 'react-highlight-words';
import { useInsertDialogHook } from '@/hooks/Dialog';
import InsertContainer from '../dialogs/insert/Dialog';
import { CollectionHttp } from '@/http/Collection';
import { FieldHttp } from '@/http/Field';
import { Field } from '../schema/Types';
import { InsertDataParam } from '../collections/Types';
import { MilvusHttp } from '@/http/Milvus';
import CreatePartitionDialog from '../dialogs/CreatePartitionDialog';
import DropPartitionDialog from '../dialogs/DropPartitionDialog';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: `calc(100vh - 160px)`,
  },
  icon: {
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
  },
  highlight: {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
}));

let timer: NodeJS.Timeout | null = null;
// get init search value from url
// const { search = '' } = parseLocationSearch(window.location.search);
const Partitions: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const classes = useStyles();
  const { t } = useTranslation('partition');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState<string>(
    (searchParams.get('search') as string) || ''
  );
  const InfoIcon = icons.info;

  const { handleInsertDialog } = useInsertDialogHook();

  const [selectedPartitions, setSelectedPartitions] = useState<PartitionView[]>(
    []
  );
  const [partitions, setPartitions] = useState<PartitionView[]>([]);
  const [searchedPartitions, setSearchedPartitions] = useState<PartitionView[]>(
    []
  );
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
  } = usePaginationHook(searchedPartitions);
  const [loading, setLoading] = useState<boolean>(true);
  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const fetchPartitions = async (collectionName: string) => {
    try {
      const res = await PartitionHttp.getPartitions(collectionName);
      setLoading(false);
      setPartitions(res);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchCollectionDetail = async (name: string) => {
    const res = await CollectionHttp.getCollection(name);
    return res;
  };

  useEffect(() => {
    fetchPartitions(collectionName);
  }, [collectionName]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    // add loading manually
    setLoading(true);
    timer = setTimeout(() => {
      const searchWords = [search];
      const list = search
        ? partitions.filter(p => p._formatName.includes(search))
        : partitions;

      const highlightList = list.map(c => {
        Object.assign(c, {
          _nameElement: (
            <Highlighter
              textToHighlight={c._formatName}
              searchWords={searchWords}
              highlightClassName={classes.highlight}
            />
          ),
        });
        return c;
      });
      setLoading(false);
      setSearchedPartitions(highlightList);
    }, 300);
  }, [search, partitions]);

  const onDelete = () => {
    openSnackBar(successTrans('delete', { name: t('partition') }));
    fetchPartitions(collectionName);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleInsert = async (
    collectionName: string,
    partitionName: string,
    fieldData: any[]
  ): Promise<{ result: boolean; msg: string }> => {
    const param: InsertDataParam = {
      partition_name: partitionName,
      fields_data: fieldData,
    };
    try {
      await CollectionHttp.insertData(collectionName, param);
      await MilvusHttp.flush(collectionName);
      // update partitions
      fetchPartitions(collectionName);

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

  const toolbarConfigs: ToolBarConfig[] = [
    {
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
      label: btnTrans('insert'),
      onClick: async () => {
        const collection = await fetchCollectionDetail(collectionName);
        const schema = collection.schema.fields.map(
          (f: Field) => new FieldHttp(f)
        );

        handleInsertDialog(
          <InsertContainer
            schema={schema}
            defaultSelectedCollection={collectionName}
            defaultSelectedPartition={
              selectedPartitions.length === 1
                ? selectedPartitions[0]._formatName
                : ''
            }
            partitions={partitions}
            handleInsert={handleInsert}
          />
        );
      },
      /**
       * insert validation:
       * 1. At least 1 available partition
       * 2. selected partition quantity shouldn't over 1
       */
      disabled: () => partitions.length === 0 || selectedPartitions.length > 1,
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
              <DropPartitionDialog
                partitions={selectedPartitions}
                collectionName={collectionName}
                onDelete={onDelete}
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
      id: '_nameElement',
      align: 'left',
      disablePadding: false,
      label: t('name'),
    },
    {
      id: '_createdTime',
      align: 'left',
      disablePadding: false,
      label: t('createdTime'),
    },
    // {
    //   id: '_statusElement',
    //   align: 'left',
    //   disablePadding: false,
    //   label: t('status'),
    // },
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
  ];

  const handleSelectChange = (value: PartitionView[]) => {
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
        onChangePage={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        isLoading={loading}
        order={order}
        orderBy={orderBy}
        handleSort={handleGridSort}
      />
    </section>
  );
};

export default Partitions;
