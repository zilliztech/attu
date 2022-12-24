import { CollectionData } from '../../collections/Types';
import { PartitionView } from '../../partitions/Types';
import { FieldData } from '../../schema/Types';
import { Option } from '../../../components/customSelector/Types';

export interface InsertContentProps {
  // optional on partition page since its collection is fixed
  collections?: CollectionData[];
  // required on partition page since user can't select collection to get schema
  schema?: FieldData[];
  // required on partition page
  partitions?: PartitionView[];

  // insert default selected collection
  // if default value is not '', collections not selectable
  defaultSelectedCollection: string;

  // insert default selected partition
  // if default value is not '', partitions not selectable
  defaultSelectedPartition: string;

  handleInsert: (
    collectionName: string,
    partitionName: string,
    fieldData: any[]
  ) => Promise<{ result: boolean; msg: string }>;
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
  handleUploadedData: (data: string, uploader: HTMLFormElement) => void;
  handleUploadFileChange: (file: File, uploader: HTMLFormElement) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

export interface InsertPreviewProps {
  schemaOptions: Option[];
  data: any[];

  tableHeads: string[];
  setTableHeads: (heads: string[]) => void;

  isContainFieldNames: number;
  handleIsContainedChange: (isContained: number) => void;
  file: File | null; // csv file
}

export interface InsertStatusProps {
  status: InsertStatusEnum;
  failMsg: string;
}
