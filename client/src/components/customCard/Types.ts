import { ReactElement } from 'react';

export interface IMenu {
  label: string | ReactElement;
  onClick?: (event: any) => void;
  disabled?: boolean;
  tip?: string | null;
}

export interface ICustomCardProps {
  showCardHeaderTitle?: boolean;
  cardHeaderTitle?: string | ReactElement;
  menu?: IMenu[];
  content: string | ReactElement;
  actions?: ReactElement;
  wrapperClassName?: string;
  showMask?: boolean;
  actionsDisabled?: boolean;
}
