import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import getCommonThemes from '../styles/theme';

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: 'light',
});
import { ATTU_THEME_MODE } from '@/consts';

const { Provider } = ColorModeContext;

type theme = 'light' | 'dark';

export const ColorModeProvider = (props: { children: React.ReactNode }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const systemTheme = prefersDarkMode ? 'dark' : 'light';
  const userThemeMode = localStorage.getItem(ATTU_THEME_MODE) || systemTheme;

  const [mode, setMode] = useState<theme>(userThemeMode as theme);

  const theme = React.useMemo(() => createTheme(getCommonThemes(mode)), [mode]);

  const toggleColorMode = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // store the current mode in localStorage
  useEffect(() => {
    localStorage.setItem(ATTU_THEME_MODE, mode);

  }, [mode]);

  return (
    <Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </Provider>
  );
};
