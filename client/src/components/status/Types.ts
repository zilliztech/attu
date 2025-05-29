import { LOADING_STATE } from '@/consts';
import type { CollectionObject } from '@server/types';
import { SxProps, Theme } from '@mui/material';

export type StatusActionType = {
  status: LOADING_STATE;
  percentage?: string | number;
  onIndexCreate?: Function;
  showExtraAction?: boolean;
  showLoadButton?: boolean;
  collection: CollectionObject;
  createIndexElement?: React.ReactNode;
  sx?: SxProps<Theme>;
};
