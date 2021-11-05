import { makeStyles, Theme } from '@material-ui/core';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
  PartitionManageParam,
  // PartitionParam,
  PartitionView,
} from './Types';
import MilvusGrid from '../../components/grid/Grid';
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
// import { StatusEnum } from '../../components/status/Types';
// import { useDialogHook } from '../../hooks/Dialog';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import Highlighter from 'react-highlight-words';
import { parseLocationSearch } from '../../utils/Format';
import { useInsertDialogHook } from '../../hooks/Dialog';
import InsertContainer from '../../components/insert/Container';
import { CollectionHttp } from '../../http/Collection';
import { FieldHttp } from '../../http/Field';
import { Field } from '../schema/Types';
import { InsertDataParam } from '../collections/Types';
import { MilvusHttp } from '../../http/Milvus';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: '100%',
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
const { search = '' } = parseLocationSearch(window.location.search);

const Partitions: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const classes = useStyles();
  const { t } = useTranslation('partition');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const InfoIcon = icons.info;

  const { handleInsertDialog } = useInsertDialogHook();
  // const LoadIcon = icons.load;
  // const ReleaseIcon = icons.release;

  // const { handleAction } = useDialogHook({ type: 'partition' });
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

  const fetchPartitions = useCallback(
    async (collectionName: string) => {
      try {
        const res = await PartitionHttp.getPartitions(collectionName);

        const partitions: PartitionView[] = res.map(p =>
          Object.assign(p, {
            _nameElement: (
              <Highlighter
                textToHighlight={p._formatName}
                searchWords={[search]}
                highlightClassName={classes.highlight}
              />
            ),
            _statusElement: <Status status={p._status} />,
          })
        );
        const filteredPartitions = partitions.filter(p =>
          p._formatName.includes(search)
        );
        setLoading(false);
        setPartitions(partitions);
        setSearchedPartitions(filteredPartitions);
      } catch (err) {
        setLoading(false);
      }
    },
    [classes.highlight]
  );

  const fetchCollectionDetail = async (name: string) => {
    const res = await CollectionHttp.getCollection(name);
    return res;
  };

  useEffect(() => {
    fetchPartitions(collectionName);
  }, [collectionName, fetchPartitions]);

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

  // const handleRelease = async (data: PartitionView) => {
  //   const param: PartitionParam = {
  //     collectionName,
  //     partitionNames: [data._name],
  //   };
  //   const res = await PartitionHttp.releasePartition(param);
  //   openSnackBar(successTrans('release', { name: t('partition') }));
  //   fetchPartitions(collectionName);
  //   return res;
  // };

  // const handleLoad = async (data: PartitionView) => {
  //   const param: PartitionParam = {
  //     collectionName,
  //     partitionNames: [data._name!],
  //   };
  //   const res = await PartitionHttp.loadPartition(param);
  //   openSnackBar(successTrans('load', { name: t('partition') }));
  //   fetchPartitions(collectionName);
  //   return res;
  // };

  const handleSearch = (value: string) => {
    if (timer) {
      clearTimeout(timer);
    }
    // add loading manually
    setLoading(true);
    timer = setTimeout(() => {
      const searchWords = [value];
      const list = value
        ? partitions.filter(p => p._formatName.includes(value))
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
  };

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
