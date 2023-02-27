export enum EPrometheusDataStatus {
  noData = -1,
  failed = -2,
}

export const fillRangeData = (
  items: any[],
  start: number,
  end: number,
  step: number
) => {
  const length = Math.floor((+end - start) / step) + 1;
  if (length >= 0) {
    const timeRange = Array(length)
      .fill(0)
      .map((_, i) => +start + i * step)
      .map(d => d / 1000);

    items.forEach(item => {
      const dict = {} as any;
      item.values.forEach(([t, v]: any) => (dict[t] = isNaN(v) ? 0 : +v));
      const minTime = Math.min(...item.values.map((d: any) => d[0]));
      item.values = timeRange.map(t =>
        t in dict
          ? dict[t]
          : t > minTime
          ? EPrometheusDataStatus.failed
          : EPrometheusDataStatus.noData
      );
    });
  }
};

export default fillRangeData;
