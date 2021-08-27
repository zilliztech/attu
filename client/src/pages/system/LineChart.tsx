
import { makeStyles, Theme } from '@material-ui/core';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    transform: 'scaleY(-1)',
  },
  ycoord: {
    cursor: 'pointer',

    "& circle": {
      transition: 'all .25s',
    },

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

const LineChart = (props: any) => {
  const fullHeight = 100;
  const fullWidth = 300;
  const step = 30;
  const classes = getStyles();
  // const { nodes } = props;
  const nodes = [
    {
      percent: 90,
      value: 2000,
      timestamp: 1629947929204,
    },

    {
      percent: 30,
      value: 2000,
      timestamp: 1629947329204,
    },

    {
      percent: 50,
      value: 2000,
      timestamp: 1629947129204,
    },

    {
      percent: 80,
      value: 2000,
      timestamp: 1629947129204,
    },

    {
      percent: 30,
      value: 2000,
      timestamp: 1629947129204,
    },

    {
      percent: 20,
      value: 2000,
      timestamp: 1629947129204,
    },
  ];

  return (
    <svg className={classes.root} width="300" height="100" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {
        nodes.map((node, index) => {
          const x1 = fullWidth - (nodes.length - index + 1) * step;
          const y1 = node.percent;
          let line = null;
          if (index < nodes.length - 1) {
            const x2 = fullWidth - (nodes.length - index) * step;
            const y2 = nodes[index + 1]['percent'];
            line = <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#06AFF2" />;
          }
          return (
            <g>
              {line}
              <g className={classes.ycoord} tabIndex={0}>
                <circle cx={x1} cy={y1} r={3} fill="white" stroke="#06AFF2" />
                <rect opacity="0" x={x1 - 5} y={0} width="10" height={fullHeight} fill="#E9E9ED" />
                <line opacity="0" x1={x1} y1={0} x2={x1} y2={fullWidth} stroke="#06AFF2" stroke-dasharray="2.5" />
              </g>
            </g>
          )
        })
      }
    </svg >
  );
};

export default LineChart;