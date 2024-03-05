import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SegmentService } from '@/http';
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
import { getLabelDisplayedRows } from '../search/Utils';

const Segments = () => {
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const classes = getQueryStyles();
  const { setDialog } = useContext(rootContext);

  const [segments, setSegments] = useState<Segment[]>([]);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();
  const gridTrans = commonTrans('grid');

  const [loading, setLoading] = useState<boolean>(true);

  const fetchSegments = async () => {
    setLoading(true);

    const psegments = await SegmentService.getPSegments(collectionName);
    const qsegments = await SegmentService.getQSegments(collectionName);

    const combinedArray = psegments.map(p => {
      const q: any = qsegments.find(q => q.segmentID === p.segmentID)! || {};
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
    {
      type: 'button',
      btnVariant: 'text',
      onClick: () => {
        fetchSegments();
      },
      label: btnTrans('refresh'),
      icon: 'refresh',
    },
  ];

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'segmentID',
      align: 'left',
      disablePadding: false,
      needCopy: true,
      label: collectionTrans('segmentID'),
    },
    {
      id: 'partitionID',
      align: 'left',
      disablePadding: false,
      needCopy: true,
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
      formatter(data, cellData, cellIndex) {
        return cellData.join(',');
      },
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
  }, [collectionName]);

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
        labelDisplayedRows={getLabelDisplayedRows(
          gridTrans[data.length > 1 ? 'segments' : 'segment']
        )}
      />
    </div>
  );
};

export default Segments;
