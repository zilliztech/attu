import { IconsType } from '../icons/Types';
import { SearchType } from '../customInput/Types';
import { ReactElement } from 'react';

export type IconConfigType = {
  [x: string]: JSX.Element;
};

export type ColorType = 'default' | 'inherit' | 'primary' | 'secondary';

/**
 * selected: selected data in table checkbox
 */
export type ToolBarType = {
  toolbarConfigs: ToolBarConfig[];
  selected?: any[];
  setSelected?: (selected: any[]) => void;
};

export type TableSwitchType = {
  defaultActive?: 'list' | 'app';
  onListClick: () => void;
  onAppClick: () => void;
};

/**
 * postion: toolbar position
 * component: when type is not iconBtn button switch, render component
 */
export type ToolBarConfig = Partial<TableSwitchType> &
  Partial<SearchType> & {
    label: string;
    icon?: IconsType;
    color?: ColorType;
    // when type is not iconBtn, onClick is optional
    onClick?: (arg0: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    disabled?: (data: any[]) => boolean;
    tooltip?: string;
    hidden?: boolean;
    type?: 'iconBtn' | 'buttton' | 'switch' | 'select' | 'groupSelect';
    position?: 'right' | 'left';
    component?: ReactElement;
  };

export type TableHeadType = {
  onSelectAllClick: (e: React.ChangeEvent) => void;
  order: any;
  orderBy: string;
  numSelected: number;
  rowCount: number;
  colDefinitions: ColDefinitionsType[];
  onRequestSort: (e: any, p: string) => void;
  openCheckBox?: boolean;
};

export type TableType = {
  selected: any[];
  onSelected: (e: React.MouseEvent, row: any) => void;
  isSelected: (data: any[]) => boolean;
  onSelectedAll: (e: React.ChangeEvent) => void;
  rows?: any[];
  colDefinitions: ColDefinitionsType[];
  primaryKey: string;
  openCheckBox?: boolean;
  disableSelect?: boolean;
  noData?: string;
  showHoverStyle?: boolean;
  isLoading?: boolean;
};

export type ColDefinitionsType = {
  id: string;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify' | undefined;
  disablePadding: boolean;
  label: React.ReactNode;
  needCopy?: boolean;
  showActionCell?: boolean;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    data?: any
  ) => void;
  getStyle?: (data: any) => {};

  onConnect?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    data: any
  ) => void;
  actionBarConfigs?: ActionBarConfig[];
};

export type MilvusGridType = ToolBarType & {
  rowCount: number;
  rowsPerPage?: number;
  primaryKey: string;
  onChangePage?: (e: any, nextPageNum: number) => void;
  labelDisplayedRows?: (obj: any) => string;
  page?: number;
  showToolbar?: boolean;
  rows: any[];
  colDefinitions: ColDefinitionsType[];
  isLoading?: boolean;
  title?: string[];
  searchForm?: React.ReactNode;
  openCheckBox?: boolean;
  titleIcon?: React.ReactNode;
  pageUnit?: string;
  disableSelect?: boolean;
  noData?: string;
  showHoverStyle?: boolean;
};

export type ActionBarType = {
  configs: ActionBarConfig[];
  row: any;
  showLabel?: boolean;
};

type ActionBarConfig = {
  onClick: (e: React.MouseEvent, row: any) => void;
  icon: IconsType;
  label?: string;
  className?: string;
  disabled?: (row: any) => boolean;
};

export type TablePaginationActionsProps = {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
};
