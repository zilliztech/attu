import { LOADING_STATE } from '@/consts';
import { CollectionObject } from '@server/types';
import React from 'react';

export type StatusActionType = {
  status: LOADING_STATE;
  percentage?: string | number;
  action?: Function;
  onIndexCreate?: Function;
  showExtraAction?: boolean;
  collection: CollectionObject;
  createIndexElement?: React.ReactNode;
};
