import { KeyValuePair } from '../../../types/Common';

export interface StatisticsCardProps {
  wrapperClass?: string;
  data: Item[];
}

export interface Item extends KeyValuePair {
  valueColor: string;
}
