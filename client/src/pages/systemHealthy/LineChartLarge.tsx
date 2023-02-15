import * as d3 from 'd3';
import { useEffect } from 'react';
import {
  CHART_WIDTH,
  LINE_CHART_LARGE_HEIGHT,
  LINE_COLOR,
  LINE_LABEL_FONT_FAMILY,
  LINE_LABEL_FONT_SIZE,
  LINE_LABEL_Y_PADDING,
} from './consts';

const LineChartLarge = ({
  data,
  format = d => d,
  unit = '',
}: {
  data: number[];
  format?: (d: any) => string;
  unit?: string;
}) => {
  const length = data.length;
  const width = CHART_WIDTH;
  const height = LINE_CHART_LARGE_HEIGHT - 3;
  const fontSize = LINE_LABEL_FONT_SIZE;
  const fontFamily = LINE_LABEL_FONT_FAMILY;

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
    >
      <g className="x-axis">
        <line x1={0} y1={height} x2={width} y2={height} stroke="#666" />
      </g>
      <g className="y-axis">
        <line x1={0} y1={0} x2={0} y2={height} stroke="#666" />
        <text x={-LINE_LABEL_Y_PADDING} y={height} textAnchor="end">
          {0}
        </text>
        <text x={-LINE_LABEL_Y_PADDING} y={fontSize} textAnchor="end">
          {format(maxData)}
        </text>
        {unit && (
          <text
            x={-LINE_LABEL_Y_PADDING}
            y={fontSize * 2}
            textAnchor="end"
            fill={'#333'}
            fontSize={fontSize - 2}
          >
            ({unit})
          </text>
        )}
      </g>
      <g className="line">
        <path
          d={line(nodes) as any}
          fill="none"
          stroke={`${LINE_COLOR}`}
          strokeWidth={3}
          opacity={0.8}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
export default LineChartLarge;
