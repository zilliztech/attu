type CustomIcon = (
  props?: any
) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;

export interface NavMenuItem {
  icon: any;
  label: string;
  key?: string;
  onClick?: () => void;
  iconActiveClass?: string;
  iconNormalClass?: string;
}

export interface NavMenuType {
  data: NavMenuItem[];
  defaultActive?: string;
  defaultOpen?: Record<string, boolean>;
  width?: string;
  versionInfo: {
    attu: string;
  };
}
