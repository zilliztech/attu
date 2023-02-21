import { EHealthyStatus, ITimeRangeOption } from './Types';

export const TOPO_WIDTH = 600;
export const TOPO_HEIGHT = 560;
export const TOPO_NODE_R = [68, 45, 30];
export const TOPO_LINK_LENGTH = [160, 270];

export const MAIN_VIEW_WIDTH = 560;
export const CHART_WIDTH = 450;
export const HEALTHY_INDEX_ROW_HEIGHT = 20;
export const HEALTHY_INDEX_ROW_GAP_RATIO = 0.3;
export const HEALTHY_STATUS_COLORS = {
  [EHealthyStatus.noData]: '#ccc',
  [EHealthyStatus.healthy]: '#6CD676',
  [EHealthyStatus.warning]: '#F4DD0E',
  [EHealthyStatus.failed]: '#F16415',
};

export const LINE_CHART_LARGE_HEIGHT = 56;
export const LINE_CHART_SMALL_HEIGHT = 42;
export const LINE_COLOR = '#394E97';
export const LINE_LABEL_Y_PADDING = 6;
export const LINE_LABEL_FONT_SIZE = 14;
export const LINE_SMALL_LABEL_FONT_SIZE = 12;
export const timeRangeOptions: ITimeRangeOption[] = [
    {
      label: '1h',
      value: 60 * 60 * 1000,
      step: 3 * 60 * 1000,
    },
    {
      label: '24h',
      value: 24 * 60 * 60 * 1000,
      step: 60 * 60 * 1000,
    },
    {
      label: '7d',
      value: 7 * 24 * 60 * 60 * 1000,
      step: 8 * 60 * 60 * 1000,
    },
  ];