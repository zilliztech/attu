import { FC } from 'react';
import { useTheme } from '@mui/material';
import type { ProgressProps } from './Types';

const Progress: FC<ProgressProps> = props => {
  const theme = useTheme();
  const { percent = 0, color = '#06F3AF' } = props;

  return (
    <svg
      width="300"
      height="30"
      viewBox="0 0 300 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        height: 'auto',
        transform: 'scaleY(-1)',
        width: '100%',
      }}
    >
      <line
        x1={10}
        y1={15}
        x2={290}
        y2={15}
        vectorEffect="non-scaling-stroke"
        strokeWidth="12"
        stroke={theme.palette.text.disabled}
        strokeLinecap="round"
        style={{ transformOrigin: '10px 15px' }}
      />
      <line
        x1={10}
        y1={15}
        x2={290}
        y2={15}
        vectorEffect="non-scaling-stroke"
        transform={`scale(${percent}, 1)`}
        strokeWidth="12"
        stroke={color}
        strokeLinecap="round"
        style={{ transformOrigin: '10px 15px' }}
      />
    </svg>
  );
};

export default Progress;
