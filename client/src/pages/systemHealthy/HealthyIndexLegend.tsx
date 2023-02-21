import { makeStyles, Theme } from '@material-ui/core';
import { HEALTHY_INDEX_ROW_HEIGHT, HEALTHY_STATUS_COLORS } from './consts';
import { EHealthyStatus } from './Types';

const legendData = [
  {
    label: 'NoData',
    value: EHealthyStatus.noData,
  },
  {
    label: 'Healthy',
    value: EHealthyStatus.healthy,
  },
  {
    label: 'Warning',
    value: EHealthyStatus.warning,
  },
  {
    label: 'Failed',
    value: EHealthyStatus.failed,
  },
];

const getStyles = makeStyles((theme: Theme) => ({
  legendItem: {
    display: 'flex',
    marginLeft: '12px',
    fontSize: '10px',
    alignItems: 'flex-end',
  },
  legendIcon: {
    width: '16px',
    borderRadius: '1px',
  },
  legendText: { marginLeft: '8px', fontWeight: 500, color: '#666' },
}));

const HealthyIndexLegend = () => {
  const classes = getStyles();
  return (
    <>
      {legendData.map(legend => (
        <div className={classes.legendItem}>
          <div
            className={classes.legendIcon}
            style={{
              background: HEALTHY_STATUS_COLORS[legend.value],
              height: `${HEALTHY_INDEX_ROW_HEIGHT * 0.8}px`,
            }}
          ></div>
          <div className={classes.legendText}>{legend.label}</div>
        </div>
      ))}
    </>
  );
};

export default HealthyIndexLegend;
