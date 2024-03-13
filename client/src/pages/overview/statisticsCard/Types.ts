import { LabelValuePair } from '../../../types/Common';
import { CollectionObject } from '@server/types';

export interface StatisticsCardProps {
  wrapperClass?: string;
  database: string;
  collections: CollectionObject[];
}

export interface Item extends LabelValuePair {
  valueColor: string;
}
