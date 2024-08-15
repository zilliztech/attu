import { ButtonProps } from '@mui/material/Button';
import { ReactElement } from 'react';

export type SimpleMenuType = {
  label: string;
  menuItems: {
    label: string | ReactElement;
    callback?: () => void;
    wrapperClass?: string;
  }[];
  buttonProps?: ButtonProps;
  className?: string;
  // e.g. 160px
  menuItemWidth?: string;
};

type CustomIcon = (
  props?: any
) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;

export type NavMenuItem = {
  icon: CustomIcon;
  iconActiveClass?: string;
  iconNormalClass?: string;
  label: string;
  onClick?: () => void;
  children?: NavMenuItem[];
};

export type NavMenuType = {
  defaultActive?: string;
  defaultOpen?: { [x: string]: boolean };
  width: string;
  data: NavMenuItem[];
  versionInfo: { attu: string; sdk: string };
};
