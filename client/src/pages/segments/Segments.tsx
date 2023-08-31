import { useEffect, useState, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CollectionHttp } from '@/http';
import { usePaginationHook } from '@/hooks';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType } from '@/components/grid/Types';
import { ToolBarConfig } from '@/components/grid/Types';
import CustomToolBar from '@/components/grid/ToolBar';
import { getQueryStyles } from '../query/Styles';

const Segments: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const classes = getQueryStyles();
  const [segments, setSegements] = useState<any[]>([]);
  const { t: collectionTrans } = useTranslation('collection');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSegments = async () => {
    setLoading(true);

    const psegments = await CollectionHttp.getPSegments(collectionName);
    const qsegments = await CollectionHttp.getQSegments(collectionName);

    const combinedArray = psegments.infos.map((p: any) => {
      const q = qsegments.infos.find((q: any) => q.segmentID === p.segmentID);
      return {
        ...p,
        ...(q &&
          Object.keys(q).reduce((acc: any, key) => {
            acc[`q_${key}`] = q[key];
            return acc;
          }, {})),
      };
    });

    setSegements(combinedArray);
    setLoading(false);
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      type: 'iconBtn',
      onClick: () => {
        fetchSegments();
      },
      label: collectionTrans('refresh'),
      icon: 'refresh',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'segmentID',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('segmentID'),
    },
    {
      id: 'partitionID',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('partitionID'),
    },
    {
      id: 'state',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('segPState'),
    },
    {
      id: 'num_rows',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('num_rows'),
    },
    {
      id: 'q_nodeIds',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('q_nodeIds'),
    },
    {
      id: 'q_state',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('q_state'),
    },
    {
      id: 'q_index_name',
      align: 'left',
      disablePadding: false,
      label: collectionTrans('q_index_name'),
    },
  ];

  useEffect(() => {
    fetchSegments();
  }, []);

  const {
    pageSize,
    handlePageSize,
    currentPage,
    handleCurrentPage,
    total,
    data,
    order,
    orderBy,
    handleGridSort,
  } = usePaginationHook(segments);

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  return (
    <div className={classes.root}>
      <CustomToolBar toolbarConfigs={toolbarConfigs} />

      <AttuGrid
        toolbarConfigs={[]}
        colDefinitions={colDefinitions}
        rows={data}
        rowCount={total}
        primaryKey="name"
        showPagination={true}
        openCheckBox={false}
        page={currentPage}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        setRowsPerPage={handlePageSize}
        isLoading={loading}
        order={order}
        orderBy={orderBy}
        handleSort={handleGridSort}
      />
    </div>
  );
};

export default Segments;
