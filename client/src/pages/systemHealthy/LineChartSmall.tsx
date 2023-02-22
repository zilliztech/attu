import * as d3 from 'd3';
import {
  CHART_WIDTH,
  HEALTHY_STATUS_COLORS,
  LINE_CHART_LARGE_HEIGHT,
  LINE_CHART_SMALL_HEIGHT,
  LINE_COLOR,
  LINE_LABEL_FONT_SIZE,
  LINE_LABEL_Y_PADDING,
  LINE_SMALL_LABEL_FONT_SIZE,
} from './consts';
import { EHealthyStatus } from './Types';

const LineChartSmall = ({
  data,
  format = d => d,
  unit = '',
  threshold,
}: {
  data: number[];
  format?: (d: any) => string;
  unit?: string;
  threshold: number;
}) => {
  const length = data.length;
  const width = CHART_WIDTH;
  const height = LINE_CHART_SMALL_HEIGHT - 3;
  const fontSize = LINE_SMALL_LABEL_FONT_SIZE;

  const xDomain = [0, length];
  const xRange = [0, CHART_WIDTH];
  let maxData = d3.max(data, d => d) as number;
  maxData = maxData === 0 ? 1 : maxData;

  const yDomain = [0, maxData * 1.1];
  const yRange = [height, 0];

  const xScale = d3.scaleLinear(xDomain, xRange);
  const yScale = d3.scaleLinear(yDomain, yRange);

  const nodes = data
    .map((d, i) => (d >= 0 ? [xScale(i + 0.5), yScale(d)] : undefined))
    .filter(a => a) as [number, number][];

  const line = d3
    .line()
    .curve(d3.curveBumpX)
    .x(d => d[0])
    .y(d => d[1]);

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
      fontSize={fontSize}
      fontWeight={500}
    >
      <g className="x-axis">
        <line x1={0} y1={height} x2={width} y2={height} stroke="#666" />
        <line
          x1={width - LINE_LABEL_Y_PADDING}
          y1={yScale(maxData)}
          x2={width}
          y2={yScale(maxData)}
          stroke="#666"
          strokeWidth="2"
        />
      </g>
      <g className="y-axis">
        <text
          x={width + LINE_LABEL_Y_PADDING}
          y={height}
          textAnchor="start"
          fill="#555"
        >
          {0}
        </text>
        <text
          x={width + LINE_LABEL_Y_PADDING}
          y={yScale(maxData) + 3}
          textAnchor="start"
          fill="#555"
        >
          {format(maxData)}
        </text>
        {unit && (
          <text
            x={width + LINE_LABEL_Y_PADDING}
            y={yScale(maxData) + 3 + fontSize}
            textAnchor="start"
            fontSize={fontSize - 2}
            fill="#555"
          >
            ({unit})
          </text>
        )}
      </g>
      <g className="line">
        {maxData >= threshold && (
          <line
            x1={xScale(0.5)}
            y1={yScale(threshold)}
            x2={xScale(data.length - 0.5)}
            y2={yScale(threshold)}
            stroke={HEALTHY_STATUS_COLORS[EHealthyStatus.warning]}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={"6 8"}
          />
        )}
        <path
          d={line(nodes) as any}
          fill="none"
          stroke={LINE_COLOR}
          strokeWidth={3}
          opacity={0.8}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
export default LineChartSmall;
