import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { FieldType } from '@zilliz/milvus-sdk-node-dev/dist/milvus/types/Collection'; // todo: need improve like export types in root file.

export class CreateCollection {
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @IsBoolean()
  @IsOptional()
  readonly autoID: boolean;

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({
    message: 'fields is empty',
  })
  readonly fields: FieldType[];
}
