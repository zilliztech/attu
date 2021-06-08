import { ReactElement } from 'react';

export type CustomToolTipType = {
  title: string;
  placement?: placement;
  children: ReactElement<any, any>;
  leaveDelay?: number;
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
