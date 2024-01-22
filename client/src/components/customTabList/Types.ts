import { ReactElement } from 'react';

export interface ITab {
  label: string;
  component: ReactElement;
  path?: string;
}

export interface ITabListProps {
  tabs: ITab[];
  activeIndex?: number;
  handleTabChange?:(index:number) => void;
  wrapperClass?: string;
}

export interface ITabPanel {
  children: ReactElement | string;
  value: number;
  index: number;
  className?: string;
}
