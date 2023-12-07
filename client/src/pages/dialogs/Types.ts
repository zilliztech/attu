import { Collection } from '@/http';
import { PartitionData } from '../partitions/Types';

export interface DropCollectionProps {
  collections: Collection[];
  onDelete: () => void;
}

export interface DropPartitionProps {
  partitions: PartitionData[];
  collectionName: string;
  onDelete: () => void;
}

export interface PartitionCreateProps {
  onCreate: () => void;
  collectionName: string;
}

interface CollectionDialogBaseProps {
  collectionName: string;
  cb?: () => void;
}

export interface CompactDialogProps extends CollectionDialogBaseProps {}

export interface CreateAliasProps {
  collectionName: string;
  cb?: () => void;
}

export interface RenameCollectionProps {
  collectionName: string;
  cb?: () => void;
}
export interface LoadSampleParam {
  collection_name: string;
  // e.g. [{vector: [1,2,3], age: 10}]
  size: string;
  download?: boolean;
  format?: 'csv' | 'json';
}
