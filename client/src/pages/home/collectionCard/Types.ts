import { CollectionObject } from '@server/types';

export interface CollectionCardProps {
  collection: CollectionObject;
  onRelease: () => void;
  wrapperClass?: string;
}
