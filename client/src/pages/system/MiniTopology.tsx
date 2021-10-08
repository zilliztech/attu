import { FC } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { MiniTopoProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  container: {
    height: '100%',
    width: 'auto',
  },
  childNode: {
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

    '&:hover, &:focus': {
      transform: 'scale(1.1)',
      filter: 'drop-shadow(3px 3px 5px rgba(0, 0, 0, .2))',
    },

    '&:focus': {
      outline: 'none',

      '& svg path': {
        fill: 'white',
      },

      '& circle': {
        fill: '#06AFF2',
        stroke: '#06AFF2',
      },

      '& text': {
        fill: 'white',
      }
    }
  },
}));

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const MiniTopo: FC<MiniTopoProps> = (props) => {
  const classes = getStyles();
  const { selectedCord, selectedChildNode, setCord } = props;
  const width = 400;                // width for svg
  const height = 400;               // height for svg
  const line = 80;                // line lenght from lv2 node
  const angle = 10;                // angle offset for lv2 node
  const r1 = 45;                    // root node radius
  const r2 = 30;                    // lv1 node radius
  const w3 = 20;                    // width of child rect

  const childNodeCenterX = width / 2 + line * Math.cos(angle * Math.PI / 180);
  const childNodeCenterY = height / 2 + line * Math.sin(angle * Math.PI / 180);

  return (
    <svg className={classes.container} width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" />
      <line x1={`${width / 3}`} y1={`${height / 3}`} x2={childNodeCenterX} y2={childNodeCenterY} stroke="#06AFF2" />
      <g className={classes.childNode} onClick={() => { setCord(null) }}>
        <circle cx={`${width / 3}`} cy={`${height / 3}`} r={r1} fill="white" stroke="#06AFF2" />
        <text fontFamily="Roboto" alignmentBaseline="middle" textAnchor="middle" fill="#06AFF2" fontWeight="700" fontSize="12" x={`${width / 3}`} y={`${height / 3}`}>{selectedCord ? capitalize(selectedCord.infos?.name) : ''}</text>
      </g>
      <g>
        <svg width="60" height="60" viewBox="0 0 60 60" x={childNodeCenterX - 30} y={childNodeCenterY - 30}>
          <circle cx={r2} cy={r2} r={r2} fill="#06AFF2" stroke="white" />
          <rect className="selected" x={r2 - w3 / 2} y={r2 - w3 / 2} width={w3} height={w3} fill="white" />
        </svg>
        <text fontFamily="Roboto" textAnchor="middle" fill="#82838E" fontSize="12" x={childNodeCenterX} y={childNodeCenterY + 50}>{`${selectedChildNode ? selectedChildNode.infos?.name : ''}`}</text>
      </g>
    </svg >
  );
};

export default MiniTopo;