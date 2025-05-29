import { ReactElement } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

export type CustomToolTipType = {
  title: string;
  placement?: placement;
  children: ReactElement<any, any>;
  leaveDelay?: number;
  enterDelay?: number;
  sx?: SxProps<Theme>;
};

type placement =
  | 'right'
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom'
  | 'left-end'
  | 'left-start'
  | 'left'
  | 'right-end'
  | 'right-start'
  | 'top-end'
  | 'top-start'
  | 'top';
