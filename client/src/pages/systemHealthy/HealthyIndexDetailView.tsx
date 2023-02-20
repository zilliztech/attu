import { makeStyles, Theme } from '@material-ui/core';
import { CHART_WIDTH, LINE_CHART_SMALL_HEIGHT } from './consts';
import HealthyIndexRow from './HealthyIndexRow';
import LineChartSmall from './LineChartSmall';
import { ENodeService, INodeTreeStructure } from './Types';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';

const getStyles = makeStyles((theme: Theme) => ({
  mainView: {
    width: '100%',
    marginTop: '16px',
  },
  healthyIndexItem: {
    display: 'flex',
    marginTop: '8px',
    justifyContent: 'space-between',
  },
  healthyIndexLabel: {
    // width: `${CHART_LABEL_WIDTH}px`,

    fontWeight: 500,
    fontSize: '12px',
    color: '#444',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  healthyIndexLabelText: {},
  healthyIndexRow: {
    width: `${CHART_WIDTH}px`,
    // border: '1px solid brown',
  },
  chartItem: {
    margin: '8px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartLabel: {
    width: `50px`,
    paddingLeft: '20px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#444',
  },
  chart: {
    height: `${LINE_CHART_SMALL_HEIGHT}px`,
    width: `${CHART_WIDTH}px`,

    // border: '1px solid brown',
  },
}));

const HealthyIndexTreeItem = ({ node }: { node: INodeTreeStructure }) => {
  const classes = getStyles();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        key={`${node.service}-${node.type}-${node.label}`}
        className={classes.healthyIndexItem}
      >
        <div
          className={classes.healthyIndexLabel}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <KeyboardArrowDownIcon fontSize="small" />
          ) : (
            <KeyboardArrowRightIcon fontSize="small" />
          )}
          <div className={classes.healthyIndexLabelText}>{`${
            node.type
          }-${node.label.slice(-5)}`}</div>
        </div>
        <div className={classes.healthyIndexRow}>
          <HealthyIndexRow statusList={node.healthyStatus} />
        </div>
      </div>
      {open && (
        <>
          <div className={classes.chartItem}>
            <div className={classes.chartLabel}>cpu</div>
            <div className={classes.chart}>
              <LineChartSmall
                data={node.cpu || []}
                format={(v: number) => v.toFixed(3)}
                unit={'Core'}
              />
            </div>
          </div>
          <div className={classes.chartItem}>
            <div className={classes.chartLabel}>memory</div>
            <div className={classes.chart}>
              <LineChartSmall
                data={node.memory || []}
                format={(v: number) => (v / 1024 / 1024 / 1024).toFixed(1)}
                unit={'GB'}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

const HealthyIndexWithTree = ({
  nodeTree,
}: {
  nodeTree: INodeTreeStructure;
}) => {
  const classes = getStyles();
  return (
    <div className={classes.mainView}>
      {!!nodeTree && (
        <div className={classes.healthyIndexItem}>
          <div className={classes.healthyIndexLabel}>{nodeTree.label}</div>
          <div className={classes.healthyIndexRow}>
            <HealthyIndexRow statusList={nodeTree?.healthyStatus || []} />
          </div>
        </div>
      )}
      {nodeTree.children.map(node => (
        <HealthyIndexTreeItem key={node.label} node={node} />
      ))}
    </div>
  );
};

const HealthyIndexWithoutTree = ({
  nodeTree,
}: {
  nodeTree: INodeTreeStructure;
}) => {
  const classes = getStyles();
  return (
    <div className={classes.mainView}>
      {nodeTree.children.map(node => (
        <div
          key={`${node.service}-${node.type}`}
          className={classes.healthyIndexItem}
        >
          <div className={classes.healthyIndexLabel}>{node.label}</div>
          <div className={classes.healthyIndexRow}>
            <HealthyIndexRow statusList={node.healthyStatus} />
          </div>
        </div>
      ))}
    </div>
  );
};

const HealthyIndexDetailView = ({
  nodeTree,
}: {
  nodeTree: INodeTreeStructure;
}) => {
  return nodeTree.service === ENodeService.milvus ? (
    <HealthyIndexWithoutTree nodeTree={nodeTree} />
  ) : (
    <HealthyIndexWithTree nodeTree={nodeTree} />
  );
};

export default HealthyIndexDetailView;
