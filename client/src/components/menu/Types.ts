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
