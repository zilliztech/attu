import { LOADING_STATE } from '@/consts';
import type { CollectionObject } from '@server/types';

export type StatusActionType = {
  status: LOADING_STATE;
  percentage?: string | number;
  action?: Function;
  onIndexCreate?: Function;
  showExtraAction?: boolean;
  showLoadButton?: boolean;
  collection: CollectionObject;
  createIndexElement?: React.ReactNode;
};
