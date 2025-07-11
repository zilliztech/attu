import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { SegmentService } from '@/http';
import { usePaginationHook } from '@/hooks';
import { rootContext } from '@/context';
import AttuGrid from '@/components/grid/Grid';
import CustomToolBar from '@/components/grid/ToolBar';
import CompactDialog from '@/pages/dialogs/CompactDialog';
import FlushDialog from '@/pages/dialogs/FlushDialog';
import { getLabelDisplayedRows } from '../../../search/Utils';
import type { ColDefinitionsType } from '@/components/grid/Types';
import type { ToolBarConfig } from '@/components/grid/Types';
import type { Segment } from './Types';

const Segments = () => {
  const { collectionName = '' } = useParams<{ collectionName: string }>();
  const { setDialog } = useContext(rootContext);

  const [segments, setSegments] = useState<Segment[]>([]);
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: commonTrans } = useTranslation();

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
      icon: 'flush',
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
      label: 'ID',
    },
    {
      id: 'level',
      align: 'left',
      disablePadding: false,
      label: 'Level',
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
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 128px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CustomToolBar toolbarConfigs={toolbarConfigs} />

      <AttuGrid
        toolbarConfigs={[]}
        colDefinitions={colDefinitions}
        rows={data}
        rowHeight={43}
        tableHeaderHeight={45}
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
          commonTrans(data.length > 1 ? 'grid.segments' : 'grid.segment')
        )}
      />
    </Box>
  );
};

export default Segments;
