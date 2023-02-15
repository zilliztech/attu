import {
  CHART_WIDTH,
  HEALTHY_INDEX_ROW_GAP_RATIO,
  HEALTHY_INDEX_ROW_HEIGHT,
  HEALTHY_STATUS_COLORS,
} from './consts';
import { EHealthyStatus } from './Types';

const HealthyIndexRow = ({ statusList }: { statusList: EHealthyStatus[] }) => {
  const length = statusList.length;
  const stautsItemWidth = length === 0 ? 0 : CHART_WIDTH / length;
  const statusBlockGap = stautsItemWidth * HEALTHY_INDEX_ROW_GAP_RATIO;
  const statusBlockWidth = stautsItemWidth * (1 - HEALTHY_INDEX_ROW_GAP_RATIO);
  return (
    <svg width={CHART_WIDTH} height={HEALTHY_INDEX_ROW_HEIGHT}>
      {statusList.map((status, i) => (
        <rect
          x={i * stautsItemWidth + statusBlockGap / 2}
          y={0}
          rx={1}
          ry={1}
          width={statusBlockWidth}
          height={HEALTHY_INDEX_ROW_HEIGHT}
          fill={HEALTHY_STATUS_COLORS[status]}
        />
      ))}
    </svg>
  );
};

export default HealthyIndexRow;
