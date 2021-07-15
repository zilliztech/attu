import { CollectionData } from '../../pages/collections/Types';
import { PartitionData } from '../../pages/partitions/Types';
import { FieldData } from '../../pages/schema/Types';
import { Option } from '../customSelector/Types';

export interface InsertContentProps {
  collections: CollectionData[];
  partitions: PartitionData[];
  // insert default selected collection
  defaultSelectedCollection: string;
  // optional if collections not selectable
  handleSelectedCollectionChange?: (name: string) => void;

  // insert default selected partition
  defaultSelectedPartition: string;
  schema: FieldData[];
  handleInsert: () => Promise<boolean>;
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
  // selectors options
  collectionOptions: Option[];
  partitionOptions: Option[];
  // selectors value
  selectedCollection: string;
  selectedPartition: string;

  // selectors change methods
  // optional if collection not selectable
  handleCollectionChange?: (collectionName: string) => void;
  handlePartitionChange: (partitionName: string) => void;
  // handle uploaded data
  handleUploadedData: (data: string) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

export interface InsertPreviewProps {
  schemaOptions: Option[];
  data: any[];

  isContainFieldNames: number;
  handleIsContainedChange: (isContained: number) => void;
}

export interface InsertStatusProps {
  status: InsertStatusEnum;
}
