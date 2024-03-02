import { LabelValuePair } from '../../../types/Common';

export interface StatisticsCardProps {
  wrapperClass?: string;
  data: Item[];
}

export interface Item extends LabelValuePair {
  valueColor: string;
}
