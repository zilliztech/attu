import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import AttuGrid from '@/components/grid/Grid';
import { ColDefinitionsType } from '@/components/grid/Types';
import { useNavigationHook } from '@/hooks';
import { ALL_ROUTER_TYPES } from '@/router/Types';
import MiniTopo from './MiniTopology';
import { getByteString, formatByteSize } from '@/utils';
import DataCard from './DataCard';
import { usePaginationHook } from '@/hooks';
import { getLabelDisplayedRows } from '@/pages/search/Utils';
import { NodeListViewProps, Node } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    height: `calc(100vh - 100px)`,
    overflow: 'auto',
    margin: '0 16px',
    display: 'grid',
    gridTemplateColumns: 'auto 400px',
    gridTemplateRows: '32px 400px auto',
    gridTemplateAreas: `"a a"
       "b ."
       "b d"`,
  },
  cardContainer: {
    display: 'grid',
    gap: '8px',
    gridTemplateColumns: 'repeat(4, minmax(300px, 1fr))',
  },
  contentContainer: {
    display: 'grid',
    marginTop: '14px',
  },
  childView: {
    height: '100%',
    width: '100%',
    transition: 'all .25s',
    position: 'absolute',
    // zIndex: 1000,
    backgroundColor: 'white',
    overflow: 'auto',
  },
  childCloseBtn: {
    border: 0,
    backgroundColor: 'white',
    gridArea: 'a',
    cursor: 'pointer',
    width: '100%',
  },
  gridContainer: {
    gridArea: 'b',
    display: 'flex',
  },
  dataCard: {
    gridArea: 'd',
  },
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
  const capacityTrans: { [key in string]: string } = commonTrans('capacity');

  const gridTrans = commonTrans('grid');

  const classes = getStyles();
  const [selectedChildNode, setSelectedChildNode] = useState<GridNode[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const { selectedCord, childNodes, setCord } = props;

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
        return Number(cellData).toFixed(2);
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
      const connectedIds = selectedCord.connected.map(
        node => node.connected_identifier
      );
      console.log('connectedIds', connectedIds, childNodes)
      const newRows: any[] = [];
      childNodes.forEach(node => {
        console.log('node.identifier', node.identifier)
        if (connectedIds.includes(node.identifier)) {
          const dataRow = {
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
      setRows(newRows);
      // make first row selected
      if (newRows.length > 0) {
        setSelectedChildNode([newRows[0]]);
      }
    }
  }, [selectedCord, childNodes]);

  const handlePageChange = (e: any, page: number) => {
    handleCurrentPage(page);
    setSelectedChildNode([]);
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
      <button className={classes.childCloseBtn} onClick={() => setCord(null)}>
        <KeyboardArrowDown />
      </button>
      <div className={classes.gridContainer}>
        <AttuGrid
          toolbarConfigs={[]}
          colDefinitions={colDefinitions}
          rows={data}
          rowCount={total}
          primaryKey="key"
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
            gridTrans[data.length > 1 ? 'properties' : 'property']
          )}
        />
      </div>
      <MiniTopo
        selectedCord={selectedCord}
        setCord={setCord}
        selectedChildNode={infoNode}
      />
      <DataCard className={classes.dataCard} node={infoNode} />
    </div>
  );
};

export default NodeListView;
