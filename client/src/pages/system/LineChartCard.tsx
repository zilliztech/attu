
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
  const fullHeight = 60;
  const fullWidth = 300;
  const round = 5;
  const step = 25;
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
    if (nodes.current.length > 9) {
      nodes.current.shift();
    }

    if (value && max.current) {
      let currentMax = max.current;
      if (value > max.current) {
        const pow = Math.ceil(Math.log10(value));
        currentMax = Math.pow(10, pow);
        max.current = currentMax;
      }

      if (nodes.current) {
        const newNodes = nodes.current.slice(0);
        const newNode = {
          percent: value / currentMax * 100,
          value,
          timestamp: Date.now(),
        }
        newNodes.push(newNode);
        nodes.current = newNodes;

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
        <svg className={classes.root} onMouseEnter={() => isHover.current = true} onMouseLeave={() => isHover.current = false} width={fullWidth} height={fullHeight} viewBox={`0 5 ${fullWidth} ${fullHeight}`} fill="white" xmlns="http://www.w3.org/2000/svg">
          {
            displayNodes.map((node, index) => {
              const x1 = fullWidth - (displayNodes.length - index + 1) * step;
              const y1 = node.percent * .5 + round * 2;

              let line = null;
              if (index < displayNodes.length - 1) {
                const x2 = fullWidth - (displayNodes.length - index) * step;
                const y2 = displayNodes[index + 1]['percent'] * .5 + round * 2;
                line = <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#06AFF2" />;
              }
              return (
                <g key={`${node.value}${index}`}>
                  {line}
                  <g className={classes.ycoord} onMouseOver={() => { setCurrentNode(node) }}>
                    <circle cx={x1} cy={y1} r={round} fill="white" stroke="#06AFF2" />
                    <rect opacity="0" x={x1 - round} y={0} width={round * 2} height={fullHeight} fill="#E9E9ED" />
                    <line opacity="0" x1={x1} y1={0} x2={x1} y2={fullWidth} strokeWidth="2" stroke="#06AFF2" strokeDasharray="2.5" />
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