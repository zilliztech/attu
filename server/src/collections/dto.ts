import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { FieldType } from '@zilliz/milvus-sdk-node-dev/dist/milvus/types/Collection'; // todo: need improve like export types in root file.
import { ApiProperty } from '@nestjs/swagger';

export class CreateCollection {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  readonly autoID: boolean;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({
    message: 'fields is empty',
  })
  readonly fields: FieldType[];
}
