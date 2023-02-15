import { makeStyles, Theme } from '@material-ui/core';
import { CHART_WIDTH, MAIN_VIEW_WIDTH } from './consts';
import HealthyIndexRow from './HealthyIndexRow';
import { INodeTreeStructure } from './Types';

// export const CHART_LABEL_WIDTH = 70;

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    width: `${MAIN_VIEW_WIDTH}px`,
    height: '100%',
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
    fontSize: '12px'
  },
  legendContainer: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  legendItem: { display: 'flex', marginLeft: '12px' },
  legendIcon: {},
  legendText: { marginLeft: '8px' },
  settingIcon: { marginLeft: '16px' },
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
  },
  healthyIndexRow: {
    width: `${CHART_WIDTH}px`,
    // border: '1px solid brown',
  },
  chartView: { width: '100%', marginTop: '30px' },
  chartItem: {
    margin: '10px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartLabel: {
    // width: `${CHART_LABEL_WIDTH}px`
  },
  chart: {
    height: '100px',
    width: `${CHART_WIDTH}px`,

    border: '1px solid brown',
  },
}));

const HealthyIndexOverview = ({ nodes }: { nodes: INodeTreeStructure[] }) => {
  const classes = getStyles();
  console.log('nodes', nodes);
  return (
    <div className={classes.root}>
      <div className={classes.headerContent}>
        <div className={classes.titleContainer}>
          <div className={classes.title}>Healthy Status</div>
          <div className={classes.timeRangeTabs}>7day / 24h / 1h</div>
        </div>
        <div className={classes.legendContainer}>
          <div className={classes.legendItem}>
            <div className={classes.legendIcon}>icon</div>
            <div className={classes.legendText}>healthy</div>
          </div>
          <div className={classes.legendItem}>
            <div className={classes.legendIcon}>icon</div>
            <div className={classes.legendText}>healthy</div>
          </div>
          <div className={classes.legendItem}>
            <div className={classes.legendIcon}>icon</div>
            <div className={classes.legendText}>healthy</div>
          </div>
          <div className={classes.settingIcon}>setting</div>
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
        <div className={classes.chartItem}>
          <div className={classes.chartLabel}>Search Count</div>
          <div className={classes.chart}></div>
        </div>
        <div className={classes.chartItem}>
          <div className={classes.chartLabel}>Search Count</div>
          <div className={classes.chart}></div>
        </div>
        <div className={classes.chartItem}>
          <div className={classes.chartLabel}>Search Count</div>
          <div className={classes.chart}></div>
        </div>
      </div>
    </div>
  );
};

export default HealthyIndexOverview;
