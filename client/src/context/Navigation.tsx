import { createContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavContextType } from './Types';
import type { NavInfo } from '@/router/Types';

export const navContext = createContext<NavContextType>({
  navInfo: {
    navTitle: '',
    backPath: '',
    showDatabaseSelector: false,
  },
  setNavInfo: () => {},
});

const { Provider } = navContext;

export const NavProvider = (props: { children: React.ReactNode }) => {
  const { t } = useTranslation('nav');

  const [navInfo, setNavInfo] = useState<NavInfo>({
    navTitle: t('overview'),
    backPath: '',
    showDatabaseSelector: false,
  });

  return <Provider value={{ navInfo, setNavInfo }}>{props.children}</Provider>;
};
