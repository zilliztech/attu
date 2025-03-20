import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Theme } from '@mui/material';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType } from '@/components/grid/Types';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/consts';
import MiniTopo from './MiniTopology';
import { getByteString, formatByteSize } from '@/utils';
import DataCard from './DataCard';
import { usePaginationHook } from '@/hooks';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { NodeListViewProps, Node } from './Types';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    overflow: 'hidden',
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.divider}`,
  },
  childCloseBtnContainer: {
    border: 0,
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    width: '100%',
    height: '28px',
  },
  childCloseBtn: {
    border: 0,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    width: '100%',
  },
  gridContainer: {
    height: `calc(100vh - 120px)`,
    display: 'flex',
    gap: 8,
  },
  leftContainer: {
    height: '100%',
    width: '70%',
  },
  rightContainer: {
    width: '30%',
    overflow: 'scroll',
  },
  dataCard: {},
}));

type GridNode = {
  id: string;
  ip: string;
  cpuCore: number;
  cpuUsage: number;
  disk: number;
  diskUsage: number;
  memUsage: number;
  name: string;
  node: Node;
};

const NodeListView: FC<NodeListViewProps> = props => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);
  const { t } = useTranslation('systemView');
  const { t: commonTrans } = useTranslation();
  const capacityTrans: { [key in string]: string } = commonTrans(
    'capacity'
  ) as any;

  const classes = getStyles();
  const [selectedChildNode, setSelectedChildNode] = useState<GridNode[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const { selectedCord, childNodes, setCord, setShowChildView } = props;

  const colDefinitions: ColDefinitionsType[] = [
    {
      id: 'name',
      label: t('thName'),
      disablePadding: true,
      sortBy: 'name',
      sortType: 'string',
    },
    {
      id: 'ip',
      label: t('thIP'),
      disablePadding: true,
      notSort: true,
      needCopy: true,
    },
    {
      id: 'cpuCore',
      label: t('thCPUCount'),
      disablePadding: true,
    },
    {
      id: 'cpuUsage',
      label: t('thCPUUsage'),
      formatter(_, cellData) {
        // -> 0.00%
        return `${cellData.toFixed(2)}%`;
      },
      disablePadding: true,
    },
    {
      id: 'diskUsage',
      label: t('thDiskUsage'),
      disablePadding: true,
      notSort: true,
      formatter(rowData) {
        return getByteString(rowData.diskUsage, rowData.disk, capacityTrans);
      },
    },
    {
      id: 'memUsage',
      label: t('thMemUsage'),
      disablePadding: true,
      formatter(_, cellData) {
        const memUsage = formatByteSize(cellData, capacityTrans);

        return `${memUsage.value}${memUsage.unit}`;
      },
    },
  ];

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
  } = usePaginationHook(rows);

  useEffect(() => {
    if (selectedCord) {
      const connectedTypes = selectedCord.connected.map(
        node => node.target_type
      );
      const newRows: any[] = [];
      childNodes.forEach(node => {
        if (connectedTypes.includes(node.infos.type)) {
          const dataRow = {
            _id: `${node?.identifier}-${node?.infos?.type}`,
            id: node?.identifier,
            ip: node?.infos?.hardware_infos.ip,
            cpuCore: node?.infos?.hardware_infos.cpu_core_count,
            cpuUsage: node?.infos?.hardware_infos.cpu_core_usage,
            disk: node?.infos?.hardware_infos.disk,
            diskUsage: node?.infos?.hardware_infos.disk_usage,
            memUsage: node?.infos?.hardware_infos.memory_usage,
            name: node?.infos?.name,
            node: node,
          };
          newRows.push(dataRow);
        }
      });

      // create mock rows 100 times to test pagination
      // const mockRows: any = [...newRows];
      // for (let i = 0; i < 100; i++) {
      //   mockRows.push({
      //     ...newRows[0],
      //     id: 'mock' + i,
      //     memUsage: i * 1000 * Math.floor(Math.random() * 100000000),
      //   });
      // }

      setRows(newRows);
      // make first row selected
      if (newRows.length > 0) {
        setSelectedChildNode([newRows[0]]);
      }
    }
  }, [selectedCord, childNodes]);

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
  };

  const handleSelectChange = (value: GridNode[]) => {
    // only select one row, filter out the rest
    if (value.length > 1) {
      value = [value[value.length - 1]];
    }
    setSelectedChildNode(value);
  };

  const infoNode = selectedChildNode[0] && selectedChildNode[0].node;

  return (
    <div className={classes.root}>
      <button
        className={classes.childCloseBtnContainer}
        onClick={() => setShowChildView(false)}
      >
        <KeyboardArrowDown className={classes.childCloseBtn} />
      </button>
      <div className={classes.gridContainer}>
        <div className={classes.leftContainer}>
          <AttuGrid
            toolbarConfigs={[]}
            colDefinitions={colDefinitions}
            rows={data}
            rowCount={total}
            primaryKey="_id"
            page={currentPage}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            setRowsPerPage={handlePageSize}
            isLoading={false}
            order={order}
            orderBy={orderBy}
            handleSort={handleGridSort}
            openCheckBox={false}
            selected={selectedChildNode}
            setSelected={handleSelectChange}
            labelDisplayedRows={getLabelDisplayedRows(
              commonTrans(data.length > 1 ? 'grid.nodes' : 'grid.node')
            )}
          />
        </div>
        <div className={classes.rightContainer}>
          {infoNode && (
            <>
              <MiniTopo
                selectedCord={selectedCord}
                setCord={setCord}
                selectedChildNode={infoNode}
                setShowChildView={setShowChildView}
              />
              <DataCard
                className={classes.dataCard}
                node={infoNode}
                extend={true}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeListView;
