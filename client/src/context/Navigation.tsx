import { createContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavInfo } from '../router/Types';
import { NavContextType } from './Types';

export const navContext = createContext<NavContextType>({
  navInfo: {
    navTitle: '',
    backPath: '',
  },
  setNavInfo: () => {},
});

const { Provider } = navContext;

export const NavProvider = (props: { children: React.ReactNode }) => {
  const { t } = useTranslation('nav');
  const [navInfo, setNavInfo] = useState<NavInfo>({
    navTitle: t('overview'),
    backPath: '',
  });

  return <Provider value={{ navInfo, setNavInfo }}>{props.children}</Provider>;
};
