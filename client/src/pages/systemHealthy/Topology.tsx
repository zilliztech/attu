import { makeStyles, Theme, useTheme } from '@material-ui/core';
import { useContext } from 'react';
import {
  TOPO_HEIGHT,
  TOPO_LINK_LENGTH,
  TOPO_NODE_R,
  TOPO_WIDTH,
} from './consts';
import { getIcon } from './getIcon';
import { ENodeService, ENodeType, INodeTreeStructure } from './Types';
import clsx from 'clsx';
import { formatPrometheusAddress } from '@/utils';
import { prometheusContext } from '@/context';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
    overflow: 'auto',
    backgroundColor: 'white',
    position: 'relative',
  },
  svg: {
    overflow: 'visible',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    margin: 'auto',
  },
  prometheusInfoContainer: {
    position: 'absolute',
    display: 'flex',
    fontSize: '12px',
    padding: '4px 8px',
    flexWrap: 'wrap',
  },
  prometheusInfoItem: {
    marginRight: '20px',
    display: 'flex',
  },
  prometheusInfoItemLabel: {
    marginRight: '8px',
    fontWeight: 600,
    color: '#333',
  },
  prometheusInfoItemText: {
    fontWeight: 500,
    color: '#666',
  },
  node: {
    transition: 'all .25s',
    cursor: 'pointer',
    transformOrigin: '50% 50%',
    transformBox: 'fill-box',

    '& circle': {
      transition: 'all .25s',
    },

    '& text': {
      transition: 'all .25s',
    },

    '&:hover': {
      transform: 'scale(1.1)',
      filter: 'drop-shadow(3px 3px 5px rgba(0, 0, 0, .2))',
      outline: 'none',
    },
  },
  selected: {
    '& svg path': {
      fill: 'white',
    },

    '& circle': {
      fill: theme.palette.primary.main,
      stroke: theme.palette.primary.main,
    },

    '& text': {
      fill: 'white',
    },
  },
}));

const randomList = Array(10)
  .fill(0)
  .map(_ => Math.random());

const nodesLayout = (
  nodes: INodeTreeStructure[],
  width: number,
  height: number
) => {
  const rootNode =
    nodes.find(node => node.service === ENodeService.root) ||
    (nodes.find(node => node.type === ENodeType.coord) as INodeTreeStructure);
  const childrenNodes = nodes.filter(node => node !== rootNode);

  const rootPos = [248, height * 0.45];
  const angleStep = (2 * Math.PI) / Math.max(childrenNodes.length, 3);
  const angleBias = angleStep * 0.4;
  const childrenPos = childrenNodes.map((node, i) => [
    rootPos[0] + Math.cos(angleStep * i) * TOPO_LINK_LENGTH[0],
    rootPos[1] + Math.sin(angleStep * i) * TOPO_LINK_LENGTH[0],
  ]);
  const subChildrenPos = childrenNodes.map((node, i) => {
    const angle = angleStep * i + (randomList[i] - 0.5) * angleBias;
    return [
      rootPos[0] + Math.cos(angle) * TOPO_LINK_LENGTH[1],
      rootPos[1] + Math.sin(angle) * TOPO_LINK_LENGTH[1],
    ];
  });
  return { rootNode, childrenNodes, rootPos, childrenPos, subChildrenPos };
};

const Topology = ({
  nodeTree,
  onClick,
  selectedService,
}: {
  nodeTree: INodeTreeStructure;
  onClick: (service: ENodeService) => void;
  selectedService: ENodeService;
}) => {
  const width = TOPO_WIDTH;
  const height = TOPO_HEIGHT;

  const classes = getStyles();
  const theme = useTheme();

  const { rootNode, childrenNodes, rootPos, childrenPos, subChildrenPos } =
    nodesLayout(nodeTree.children, width, height);

  const { prometheusAddress, prometheusInstance, prometheusNamespace } =
    useContext(prometheusContext);
  const prometheusInfos = [
    {
      label: 'Prometheus Address',
      value: formatPrometheusAddress(prometheusAddress),
    },
    {
      label: 'Namespace',
      value: prometheusNamespace,
    },
    {
      label: 'Instance',
      value: prometheusInstance,
    },
  ];

  return (
    <div className={classes.root}>
      <div className={classes.prometheusInfoContainer}>
        {prometheusInfos.map(prometheusInfo => (
          <div
            key={prometheusInfo.value}
            className={classes.prometheusInfoItem}
          >
            <div className={classes.prometheusInfoItemLabel}>
              {prometheusInfo.label}:
            </div>
            <div className={classes.prometheusInfoItemText}>
              {prometheusInfo.value}
            </div>
          </div>
        ))}
      </div>
      <svg
        className={classes.svg}
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        {childrenNodes.map((node, i) => {
          const childPos = childrenPos[i];
          const subChildPos = subChildrenPos[i];

          return (
            <g key={node.label}>
              {node.children.length > 0 && (
                <g
                  className={classes.node}
                  onClick={() => onClick(node.service)}
                >
                  <line
                    x1={childPos[0]}
                    y1={childPos[1]}
                    x2={subChildPos[0]}
                    y2={subChildPos[1]}
                    stroke={theme.palette.primary.main}
                  />
                  <circle
                    cx={subChildPos[0]}
                    cy={subChildPos[1]}
                    r={TOPO_NODE_R[2]}
                    fill="#fff"
                    stroke={theme.palette.primary.main}
                  />
                  {getIcon(
                    node.children[0],
                    theme,
                    subChildPos[0] - 30,
                    subChildPos[1] - 30
                  )}

                  <text
                    textAnchor="middle"
                    fill={theme.palette.attuGrey.dark}
                    fontSize="12"
                    x={subChildPos[0]}
                    y={subChildPos[1] + 50}
                  >{`${node.children.length - 1} Node(s)`}</text>
                </g>
              )}
              <g
                className={clsx(
                  classes.node,
                  node.service === selectedService && classes.selected
                )}
                onClick={() => onClick(node.service)}
              >
                <line
                  x1={rootPos[0]}
                  y1={rootPos[1]}
                  x2={childPos[0]}
                  y2={childPos[1]}
                  stroke={theme.palette.primary.main}
                />
                <circle
                  cx={childPos[0]}
                  cy={childPos[1]}
                  r={TOPO_NODE_R[1]}
                  fill="#fff"
                  stroke={theme.palette.primary.main}
                />

                {node.type === ENodeType.overview &&
                  getIcon(node, theme, childPos[0] - 12, childPos[1] - 20)}

                <text
                  textAnchor="middle"
                  fill={theme.palette.primary.main}
                  fontWeight="700"
                  fontSize="12"
                  x={childPos[0]}
                  y={childPos[1] + (node.type === ENodeType.overview ? 18 : 6)}
                >
                  {node.type === ENodeType.overview
                    ? node.label
                    : `${node.type}-${node.label.slice(-5)}`}
                </text>
              </g>

              <g
                onClick={() => onClick(rootNode.service)}
                className={clsx(
                  classes.node,
                  rootNode.service === selectedService && classes.selected
                )}
              >
                <circle
                  cx={rootPos[0]}
                  cy={rootPos[1]}
                  r={TOPO_NODE_R[0]}
                  fill="#fff"
                  stroke={theme.palette.primary.main}
                />
                <text
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={theme.palette.primary.main}
                  fontWeight="700"
                  fontSize="24"
                  x={`${rootPos[0]}`}
                  y={`${rootPos[1]}`}
                >
                  {rootNode.type === ENodeType.overview
                    ? rootNode.label
                    : `${rootNode.service}`}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Topology;
