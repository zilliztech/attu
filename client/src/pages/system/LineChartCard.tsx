
import { FC, useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core';
import BaseCard from './BaseCard';
import { LineChartCardProps, LinceChartNode } from './Types';

const getStyles = makeStyles(() => ({
  root: {
    transform: 'scaleY(-1)',
    maxWidth: '90%',
  },
  ycoord: {
    cursor: 'pointer',
    "&:hover, &:focus": {
      "& line": {
        transition: 'all .25s',
        opacity: 1,
      },
    },

    "&:hover": {
      "& circle": {
        fill: '#06AFF2',
      },
    },

    "&:focus": {
      outline: 'none',

      "& circle": {
        fill: '#06F3AF',
      },
    },
  }
}));

const LineChartCard: FC<LineChartCardProps> = (props) => {

  const FULL_HEIGHT = 60;
  const FULL_WIDTH = 300;
  const ROUND = 5;
  const STEP = 25;

  const classes = getStyles();
  const { title, value } = props;
  const [displayNodes, setDisplayNodes] = useState<LinceChartNode[]>([]);
  const [currentNode, setCurrentNode] = useState<LinceChartNode>({
    percent: 0,
    value: 0,
    timestamp: Date.now(),
  });

  const max = useRef(1);
  const isHover = useRef(false);
  const nodes = useRef<LinceChartNode[]>([]);

  useEffect(() => {
    // show at most 10 nodes. so remove the earliest node when nodes exceed 10
    if (nodes.current.length > 9) {
      nodes.current.shift();
    }

    if (value && max.current) {
      // calculate the y-axis max scale
      let currentMax = max.current;
      if (value > max.current) {
        const pow = Math.ceil(Math.log10(value));
        currentMax = Math.pow(10, pow);
        max.current = currentMax;
      }

      // generate a new node and save in ref
      if (nodes.current) {
        const newNodes = nodes.current.slice(0);
        const newNode = {
          percent: value / currentMax * 100,
          value,
          timestamp: Date.now(),
        }
        newNodes.push(newNode);
        nodes.current = newNodes;

        // refresh nodes for display when mouse is not hovering on the chart
        if (!isHover.current) {
          setDisplayNodes(newNodes);
          setCurrentNode(newNode);
        }
      }
    }
  }, [value]);

  return (
    nodes.current.length ? (
      <BaseCard title={title} content={`${Math.round(currentNode.value)}ms`} desc={new Date(currentNode.timestamp).toLocaleString()}>
        <svg className={classes.root} onMouseEnter={() => isHover.current = true} onMouseLeave={() => isHover.current = false} width={FULL_WIDTH} height={FULL_HEIGHT} viewBox={`0 5 ${FULL_WIDTH} ${FULL_HEIGHT}`} fill="white" xmlns="http://www.w3.org/2000/svg">
          {
            displayNodes.map((node, index) => {
              const x1 = FULL_WIDTH - (displayNodes.length - index + 1) * STEP;
              const y1 = node.percent * .5 + ROUND * 2;

              let line = null;
              if (index < displayNodes.length - 1) {
                const x2 = FULL_WIDTH - (displayNodes.length - index) * STEP;
                const y2 = displayNodes[index + 1]['percent'] * .5 + ROUND * 2;
                line = <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#06AFF2" />;
              }
              return (
                <g key={`${node.value}${index}`}>
                  {line}
                  <g className={classes.ycoord} onMouseOver={() => { setCurrentNode(node) }}>
                    <circle cx={x1} cy={y1} r={ROUND} fill="white" stroke="#06AFF2" />
                    <rect opacity="0" x={x1 - ROUND} y={0} width={ROUND * 2} height={FULL_HEIGHT} fill="#E9E9ED" />
                    <line opacity="0" x1={x1} y1={0} x2={x1} y2={FULL_WIDTH} strokeWidth="2" stroke="#06AFF2" strokeDasharray="2.5" />
                  </g>
                </g>
              )
            })
          }
        </svg>
      </BaseCard >
    ) : <BaseCard title={title} />
  );
};

export default LineChartCard;