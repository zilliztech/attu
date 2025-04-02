import type { PartitionData, CollectionObject } from '@server/types';

export interface DropCollectionProps {
  collections: CollectionObject[];
  onDelete: () => void;
}

export interface PartitionCreateProps {
  onCreate: (collectionName: string) => void;
  collectionName: string;
}

interface CollectionDialogBaseProps {
  collectionName: string;
  cb?: () => void;
}

export interface CompactDialogProps extends CollectionDialogBaseProps {}
export interface FlushDialogProps extends CollectionDialogBaseProps {}

export interface LoadSampleParam {
  collection_name: string;
  // e.g. [{vector: [1,2,3], age: 10}]
  size: string;
  download?: boolean;
  format?: 'csv' | 'json';
}
