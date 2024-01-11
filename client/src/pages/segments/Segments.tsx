import { useEffect, useState, FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Segement } from '@/http';
import { usePaginationHook } from '@/hooks';
import { rootContext } from '@/context';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType } from '@/components/grid/Types';
import { ToolBarConfig } from '@/components/grid/Types';
import CustomToolBar from '@/components/grid/ToolBar';
import CompactDialog from '@/pages/dialogs/CompactDialog';
import FlushDialog from '@/pages/dialogs/FlushDialog';
import { getQueryStyles } from '../query/Styles';
import { Segment } from './Types';

const Segments: FC<{
  collectionName: string;
}> = ({ collectionName }) => {
  const classes = getQueryStyles();
  const { setDialog } = useContext(rootContext);

  const [segments, setSegments] = useState<Segment[]>([]);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const [loading, setLoading] = useState<boolean>(true);

  const fetchSegments = async () => {
    setLoading(true);

    const psegments = (await Segement.getPSegments(collectionName)) || {};
    const qsegments = (await Segement.getQSegments(collectionName)) || {};

    const combinedArray = psegments.infos.map(p => {
      const q: any =
        qsegments.infos.find(q => q.segmentID === p.segmentID)! || {};
      return {
        ...p,
        ...Object.keys(q).reduce((acc, key) => {
          acc[`q_${key}`] = q[key];
          return acc;
        }, {} as any),
      };
    });

    setSegments(combinedArray);
    setLoading(false);
  };

  const onCompactExecuted = async () => {
    await fetchSegments();
  };

  const toolbarConfigs: ToolBarConfig[] = [
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        fetchSegments();
      },
      label: btnTrans('refresh'),
      icon: 'refresh'
    },
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <CompactDialog
                collectionName={collectionName}
                cb={onCompactExecuted}
              />
            ),
          },
        });
      },
      label: btnTrans('compact'),
      icon: 'compact',
    },
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        setDialog({
          open: true,
          type: 'custom',
          params: {
            component: (
              <FlushDialog
                collectionName={collectionName}
                cb={onCompactExecuted}
              />
            ),
          },
        });
      },
      label: btnTrans('flush'),
      icon: 'saveAs',
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
    // {
    //   id: 'q_index_name',
    //   align: 'left',
    //   disablePadding: false,
    //   label: collectionTrans('q_index_name'),
    // },
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
