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

  const WIDTH = 400;                // width for svg
  const HEIGHT = 400;               // height for svg
  const LINE = 80;                // line lenght from lv2 node
  const ANGLE = 10;                // angle offset for lv2 node
  const R1 = 45;                    // root node radius
  const R2 = 30;                    // lv1 node radius
  const W3 = 20;                    // width of child rect

  const childNodeCenterX = WIDTH / 2 + LINE * Math.cos(ANGLE * Math.PI / 180);
  const childNodeCenterY = HEIGHT / 2 + LINE * Math.sin(ANGLE * Math.PI / 180);

  return (
    <svg className={classes.container} width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white" />
      <line x1={`${WIDTH / 3}`} y1={`${HEIGHT / 3}`} x2={childNodeCenterX} y2={childNodeCenterY} stroke="#06AFF2" />
      <g className={classes.childNode} onClick={() => { setCord(null) }}>
        <circle cx={`${WIDTH / 3}`} cy={`${HEIGHT / 3}`} r={R1} fill="white" stroke="#06AFF2" />
        <text fontFamily="Roboto" alignmentBaseline="middle" textAnchor="middle" fill="#06AFF2" fontWeight="700" fontSize="12" x={`${WIDTH / 3}`} y={`${HEIGHT / 3}`}>{selectedCord ? capitalize(selectedCord.infos?.name) : ''}</text>
      </g>
      <g>
        <svg width="60" height="60" viewBox="0 0 60 60" x={childNodeCenterX - 30} y={childNodeCenterY - 30}>
          <circle cx={R2} cy={R2} r={R2} fill="#06AFF2" stroke="white" />
          <rect className="selected" x={R2 - W3 / 2} y={R2 - W3 / 2} width={W3} height={W3} fill="white" />
        </svg>
        <text fontFamily="Roboto" textAnchor="middle" fill="#82838E" fontSize="12" x={childNodeCenterX} y={childNodeCenterY + 50}>{`${selectedChildNode ? selectedChildNode.infos?.name : ''}`}</text>
      </g>
    </svg >
  );
};

export default MiniTopo;