import { CollectionData } from '../collections/Types';
import { PartitionData } from '../partitions/Types';

export interface LoadSampleParam {
  collection_name: string;
  // e.g. [{vector: [1,2,3], age: 10}]
  size: string;
}

export interface DropCollectionProps {
  collections: CollectionData[];
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
