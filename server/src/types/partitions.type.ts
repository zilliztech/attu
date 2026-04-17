export type PartitionData = {
  name: string;
  id: number;
  rowCount: string | number;
  createdTime: string;
  status?: 'loaded' | 'loading' | 'unloaded';
  loadedPercentage?: number;
};
