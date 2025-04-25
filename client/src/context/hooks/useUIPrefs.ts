import { useState, useEffect } from 'react';
import { DEFAULT_TREE_WIDTH, ATTU_UI_TREE_WIDTH } from '@/consts';
import type { DataContextType } from '@/context/Types';

export const useUIPrefs = () => {
  const [ui, setUI] = useState<DataContextType['ui']>({
    tree: {
      width: DEFAULT_TREE_WIDTH,
    },
  });

  // set UI preferences
  const setUIPref = (pref: DataContextType['ui']) => {
    setUI(pref);
    localStorage.setItem(ATTU_UI_TREE_WIDTH, String(pref.tree.width));
  };

  // load UI preferences
  useEffect(() => {
    const storedWidth = Number(localStorage.getItem(ATTU_UI_TREE_WIDTH));
    if (storedWidth) {
      setUI(prevUI => ({
        ...prevUI,
        tree: {
          ...prevUI.tree,
          width: storedWidth,
        },
      }));
    }
  }, []);

  return { ui, setUIPref };
};
