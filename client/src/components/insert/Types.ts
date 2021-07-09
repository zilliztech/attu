import { CollectionData } from '../../pages/collections/Types';
import { PartitionData } from '../../pages/partitions/Types';
import { FieldData } from '../../pages/schema/Types';
import { Option } from '../customSelector/Types';

export interface InsertContentProps {
  collections: CollectionData[];
  selectedCollection: string;
  partitions: PartitionData[];
  selectedPartition: string;
  schema: FieldData[];
  handleInsert: () => void;
}

export enum InsertStepperEnum {
  import,
  preview,
  status,
}

export enum InsertStatusEnum {
  // init means not begin yet
  init = 'init',
  loading = 'loading',
  success = 'success',
  error = 'error',
}

export interface InsertImportProps {
  collectionOptions: Option[];
  partitionOptions: Option[];
  selectedCollection: string;
  selectedPartition: string;
}

export interface InsertPreviewProps {
  schemaOptions: Option[];
}

export interface InsertStatusProps {
  status: InsertStatusEnum;
}
