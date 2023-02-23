import { makeStyles, Theme } from '@material-ui/core';
import { CHART_WIDTH, LINE_CHART_SMALL_HEIGHT } from './consts';
import HealthyIndexRow from './HealthyIndexRow';
import LineChartSmall from './LineChartSmall';
import { ENodeService, INodeTreeStructure, IThreshold } from './Types';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Dispatch, SetStateAction, useState } from 'react';

const getStyles = makeStyles((theme: Theme) => ({
  mainView: {
    width: '100%',
    marginTop: '20px',
  },
  healthyIndexItem: {
    display: 'flex',
    marginTop: '8px',
    justifyContent: 'space-between',
  },
  healthyIndexLabel: {
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
  },
  chartItem: {
    margin: '8px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
}));

const HealthyIndexTreeItem = ({
  node,
  threshold,
}: {
  node: INodeTreeStructure;
  threshold: IThreshold;
}) => {
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
                threshold={threshold.cpu}
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
                threshold={threshold.memory}
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
  setSelectedService,
  threshold,
}: {
  nodeTree: INodeTreeStructure;
  setSelectedService: Dispatch<SetStateAction<ENodeService>>;
  threshold: IThreshold;
}) => {
  const classes = getStyles();
  return (
    <div className={classes.mainView}>
      {!!nodeTree && (
        <div className={classes.healthyIndexItem}>
          <div
            className={classes.healthyIndexLabel}
            onClick={() => setSelectedService(ENodeService.root)}
          >
            {nodeTree.label}
          </div>
          <div className={classes.healthyIndexRow}>
            <HealthyIndexRow statusList={nodeTree?.healthyStatus || []} />
          </div>
        </div>
      )}
      {!!nodeTree &&
        nodeTree.children.map(node => (
          <HealthyIndexTreeItem
            key={node.label}
            node={node}
            threshold={threshold}
          />
        ))}
    </div>
  );
};

const HealthyIndexWithoutTree = ({
  nodeTree,
  setSelectedService,
}: {
  nodeTree: INodeTreeStructure;
  setSelectedService: Dispatch<SetStateAction<ENodeService>>;
}) => {
  const classes = getStyles();
  return (
    <div className={classes.mainView}>
      {nodeTree.children.map(node => (
        <div
          key={`${node.service}-${node.type}`}
          className={classes.healthyIndexItem}
        >
          <div
            className={classes.healthyIndexLabel}
            onClick={() => setSelectedService(node.service)}
          >
            {node.label}
          </div>
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
  setSelectedService,
  threshold,
}: {
  nodeTree: INodeTreeStructure;
  setSelectedService: Dispatch<SetStateAction<ENodeService>>;
  threshold: IThreshold;
}) => {
  return nodeTree.service === ENodeService.milvus ? (
    <HealthyIndexWithoutTree
      nodeTree={nodeTree}
      setSelectedService={setSelectedService}
    />
  ) : (
    <HealthyIndexWithTree
      nodeTree={nodeTree}
      setSelectedService={setSelectedService}
      threshold={threshold}
    />
  );
};

export default HealthyIndexDetailView;
