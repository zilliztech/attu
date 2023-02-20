import { makeStyles, Theme } from '@material-ui/core';
import { Dispatch, SetStateAction } from 'react';
import {
  CHART_WIDTH,
  LINE_CHART_LARGE_HEIGHT,
  MAIN_VIEW_WIDTH,
} from './consts';
import HealthyIndexLegend from './HealthyIndexLegend';
import HealthyIndexRow from './HealthyIndexRow';
import LineChartLarge from './LineChartLarge';
import ThresholdPanel from './ThresholdPanel';
import ThresholdSetting from './ThresholdSetting';
import { ILineChartData, INodeTreeStructure, IThreshold } from './Types';
// import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

// export const CHART_LABEL_WIDTH = 70;

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    width: `${MAIN_VIEW_WIDTH}px`,
    height: '100%',
    padding: '12px 16px',
    // boxShadow: '0 0 5px #ccc',
    fontSize: '14px',
  },
  headerContent: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
  },
  titleContainer: {},
  title: {
    fontSize: '18px',
    fontWeight: 500,
  },
  timeRangeTabs: {
    fontSize: '12px',
  },
  legendContainer: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  settingIcon: { marginLeft: '16px', display: 'flex', alignItems: 'flex-end' },
  mainView: {
    width: '100%',
    marginTop: '12px',
  },
  healthyIndexItem: {
    display: 'flex',
    marginTop: '6px',
    justifyContent: 'space-between',
  },
  healthyIndexLabel: {
    // width: `${CHART_LABEL_WIDTH}px`,

    fontWeight: 500,
    color: '#444',
  },
  healthyIndexRow: {
    width: `${CHART_WIDTH}px`,
    // border: '1px solid brown',
  },
  chartView: { width: '100%', marginTop: '30px' },
  chartItem: {
    margin: '24px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartLabel: {
    width: `50px`,
    fontWeight: 500,
    color: '#444',
  },
  chart: {
    height: `${LINE_CHART_LARGE_HEIGHT}px`,
    width: `${CHART_WIDTH}px`,

    // border: '1px solid brown',
  },
}));

const HealthyIndexOverview = ({
  nodes,
  lineChartsData,
  threshold,
  setThreshold,
}: {
  nodes: INodeTreeStructure[];
  lineChartsData: ILineChartData[];
  threshold: IThreshold;
  setThreshold: Dispatch<SetStateAction<IThreshold>>;
}) => {
  const classes = getStyles();
  console.log('nodes', nodes);
  console.log('lineChartsData', lineChartsData);
  return (
    <div className={classes.root}>
      <div className={classes.headerContent}>
        <div className={classes.titleContainer}>
          <div className={classes.title}>Healthy Status</div>
          <div className={classes.timeRangeTabs}>
            <span>
              <b>7day</b>
            </span>
            <span> / </span>
            <span>24h</span>
            <span> / </span>
            <span>1h</span>
          </div>
        </div>
        <div className={classes.legendContainer}>
          <HealthyIndexLegend />
          <div className={classes.settingIcon}>
            <ThresholdSetting
              threshold={threshold}
              setThreshold={setThreshold}
            />
          </div>
        </div>
      </div>
      <div className={classes.mainView}>
        {nodes.map(node => (
          <div className={classes.healthyIndexItem}>
            <div className={classes.healthyIndexLabel}>{node.label}</div>
            <div className={classes.healthyIndexRow}>
              <HealthyIndexRow statusList={node.healthyStatus} />
            </div>
          </div>
        ))}
      </div>
      <div className={classes.chartView}>
        <div className={classes.title}>Search Query History</div>
        {lineChartsData.map(chartData => (
          <div className={classes.chartItem}>
            <div className={classes.chartLabel}>{chartData.label}</div>
            <div className={classes.chart}>
              <LineChartLarge
                data={chartData.data}
                format={chartData.format}
                unit={chartData.unit}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthyIndexOverview;
