import { EHealthyStatus } from './Types';

export const MAIN_VIEW_WIDTH = 600;
export const CHART_WIDTH = 500;
export const HEALTHY_INDEX_ROW_HEIGHT = 20;
export const HEALTHY_INDEX_ROW_GAP_RATIO = 0.3;
export const HEALTHY_STATUS_COLORS = {
  [EHealthyStatus.noData]: '#ccc',
  [EHealthyStatus.healthy]: '#6CD676',
  [EHealthyStatus.warning]: '#F4DD0E',
  [EHealthyStatus.failed]: '#F16415',
};
