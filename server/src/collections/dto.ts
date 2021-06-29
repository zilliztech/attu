import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { FieldType } from '@zilliz/milvus-sdk-node-dev/dist/milvus/types/Collection'; // todo: need improve like export types in root file.
import { DataType } from '@zilliz/milvus-sdk-node-dev/dist/milvus/types/Common';
import { ApiProperty } from '@nestjs/swagger';


export class CreateCollection {
  @ApiProperty({
    description: 'Milvus collection name'
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty({
    description: 'Generate ID automatically by milvus',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  readonly autoID: boolean;

  @ApiProperty({
    description: 'Field data type',
    enum: DataType
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({
    message: 'fields is empty',
  })
  readonly fields: FieldType[];
}
