import { makeStyles, Theme } from '@material-ui/core';
import { Dispatch, SetStateAction } from 'react';
import {
  CHART_WIDTH,
  LINE_CHART_LARGE_HEIGHT,
  MAIN_VIEW_WIDTH,
  TOPO_HEIGHT,
} from './consts';
import HealthyIndexDetailView from './HealthyIndexDetailView';
import HealthyIndexLegend from './HealthyIndexLegend';
import HealthyIndexRow from './HealthyIndexRow';
import LineChartLarge from './LineChartLarge';
import ThresholdSetting from './ThresholdSetting';
import TimeRangeTabs from './TimeRangeTabs';
import {
  ENodeService,
  ILineChartData,
  INodeTreeStructure,
  IThreshold,
  ITimeRangeOption,
} from './Types';
// import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

// export const CHART_LABEL_WIDTH = 70;

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    width: `${MAIN_VIEW_WIDTH}px`,
    height: `${TOPO_HEIGHT}px`,
    overflow: 'auto',
    padding: '8px 56px 0px 24px',
    fontSize: '14px',
  },
  headerContent: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
  },
  titleContainer: {},
  title: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  titleMain: { fontSize: '18px', fontWeight: 500 },
  titleExt: { fontSize: '18px', fontWeight: 500, marginLeft: '8px' },
  timeRangeTabs: {
    fontSize: '12px',
  },
  legendContainer: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  settingIcon: { marginLeft: '12px', display: 'flex', alignItems: 'flex-end' },

  chartView: { width: '100%', marginTop: '24px' },
  chartItem: {
    margin: '16px 0',
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
  selectedNode,
  lineChartsData,
  threshold,
  setThreshold,
  timeRange,
  setTimeRange,
  setSelectedService,
}: {
  selectedNode: INodeTreeStructure;
  lineChartsData: ILineChartData[];
  threshold: IThreshold;
  setThreshold: (threshold: IThreshold) => void;
  timeRange: ITimeRangeOption;
  setTimeRange: Dispatch<SetStateAction<ITimeRangeOption>>;
  setSelectedService: Dispatch<SetStateAction<ENodeService>>;
}) => {
  const classes = getStyles();
  return (
    <div className={classes.root}>
      <div className={classes.headerContent}>
        <div className={classes.titleContainer}>
          <div className={classes.title}>
            <div className={classes.titleMain}>Healthy Status</div>
            {selectedNode.service !== ENodeService.milvus && (
              <div className={classes.titleExt}>
                {`> ${selectedNode.service}`}
              </div>
            )}
          </div>
          <div className={classes.timeRangeTabs}>
            <TimeRangeTabs timeRange={timeRange} setTimeRange={setTimeRange} />
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
      <HealthyIndexDetailView
        nodeTree={selectedNode}
        setSelectedService={setSelectedService}
        threshold={threshold}
      />
      {selectedNode.service === ENodeService.milvus && (
        <div className={classes.chartView}>
          <div className={classes.titleMain}>Search Query History</div>
          {lineChartsData.map(chartData => (
            <div key={chartData.label} className={classes.chartItem}>
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
      )}
    </div>
  );
};

export default HealthyIndexOverview;
