import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export enum ManageType {
  DELETE = 'delete',
  CREATE = 'create',
}
export class GetPartitionsInfo {
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;
}

export class ManagePartition {
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @IsString()
  @IsNotEmpty({
    message: 'partition_name is empty',
  })
  readonly partition_name: string;

  @IsEnum(ManageType, { message: 'Type allow delete and create' })
  readonly type: ManageType;
}

export class LoadPartitions {
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({
    message: 'partition_names is empty',
  })
  readonly partition_names: string[];
}
