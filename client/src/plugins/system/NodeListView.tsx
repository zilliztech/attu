import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import MiniTopo from './MiniTopology';
import { getByteString } from '../../utils/Format';
import DataCard from './DataCard';
import { NodeListViewProps, Node } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    fontFamily: 'Roboto',
    margin: '14px 40px',
    display: 'grid',
    gridTemplateColumns: 'auto 400px',
    gridTemplateRows: '40px 400px auto',
    gridTemplateAreas:
      `"a a"
       "b ."
       "b d"`,
    height: 'calc(100% - 28px)',
  },
  cardContainer: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(4, minmax(300px, 1fr))',
  },
  contentContainer: {
    borderRadius: '8px',
    boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',
    display: 'grid',
    marginTop: '14px',
  },
  childView: {
    height: '100%',
    width: '100%',
    transition: 'all .25s',
    position: 'absolute',
    zIndex: 1000,
    backgroundColor: 'white',
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
  }
}));

const NodeListView: FC<NodeListViewProps> = (props) => {
  useNavigationHook(ALL_ROUTER_TYPES.SYSTEM);
  const { t } = useTranslation('systemView');
  const { t: commonTrans } = useTranslation();
  const capacityTrans: { [key in string]: string } = commonTrans('capacity');

  const classes = getStyles();
  const [selectedChildNode, setSelectedChildNode] = useState<Node | undefined>();
  const [rows, setRows] = useState<any[]>([]);
  const { selectedCord, childNodes, setCord } = props;

  let columns: any[] = [
    {
      field: 'name',
      headerName: t('thName'),
      flex: 1,
    },
    {
      field: 'ip',
      headerName: t('thIP'),
      flex: 1,
    },
    {
      field: 'cpuCore',
      headerName: t('thCPUCount'),
      flex: 1,
    },
    {
      field: 'cpuUsage',
      headerName: t('thCPUUsage'),
      flex: 1,
    },
    {
      field: 'diskUsage',
      headerName: t('thDiskUsage'),
      flex: 1,
    },
    {
      field: 'memUsage',
      headerName: t('thMemUsage'),
      flex: 1,
    },
  ];

  useEffect(() => {
    if (selectedCord) {
      const connectedIds = selectedCord.connected.map(node => node.connected_identifier);
      const newRows: any[] = [];
      childNodes.forEach(node => {
        if (connectedIds.includes(node.identifier)) {
          const dataRow = {
            id: node?.identifier,
            ip: node?.infos?.hardware_infos.ip,
            cpuCore: node?.infos?.hardware_infos.cpu_core_count,
            cpuUsage: node?.infos?.hardware_infos.cpu_core_usage,
            diskUsage: getByteString(node?.infos?.hardware_infos.disk_usage, node?.infos?.hardware_infos.disk, capacityTrans),
            memUsage: getByteString(node?.infos?.hardware_infos.memory_usage, node?.infos?.hardware_infos.memory, capacityTrans),
            name: node?.infos?.name,
          }
          newRows.push(dataRow);
        }
      })
      setRows(newRows);
    }
  }, [selectedCord, childNodes, capacityTrans]);

  return (
    <div className={classes.root}>
      <button className={classes.childCloseBtn} onClick={() => setCord(null)}>
        <KeyboardArrowDown />
      </button>
      <div className={classes.gridContainer}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooterPagination
          hideFooterSelectedRowCount
          onRowClick={(rowData) => {
            const selectedNode = childNodes.find(node => rowData.row.id === node.identifier);
            setSelectedChildNode(selectedNode);
          }}
        />
      </div>
      <MiniTopo selectedCord={selectedCord} setCord={setCord} selectedChildNode={selectedChildNode} />
      <DataCard className={classes.dataCard} node={selectedChildNode} />
    </div>

  );
};

export default NodeListView;
