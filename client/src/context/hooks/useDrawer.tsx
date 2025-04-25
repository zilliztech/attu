import React, { useState } from 'react';
import type { DrawerType } from '../Types';

const defaultDrawer: DrawerType = {
  open: false,
  title: '',
  content: <></>,
  hasActionBar: false,
  actions: [],
};

export function useDrawer(initial: DrawerType = defaultDrawer) {
  const [drawer, setDrawer] = useState<DrawerType>(initial);
  return { drawer, setDrawer };
}
