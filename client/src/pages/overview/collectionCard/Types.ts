import { CollectionObject } from '@server/types';

export interface CollectionCardProps {
  data: CollectionObject;
  onRelease: () => void;
  wrapperClass?: string;
}
