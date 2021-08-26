import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  ArrayMinSize,
  IsObject,
} from 'class-validator';
import {
  FieldType,
  ShowCollectionsType,
} from '@zilliz/milvus2-sdk-node/dist/milvus/types/Collection';
import { DataType } from '@zilliz/milvus2-sdk-node/dist/milvus/types/Common';
import { ApiProperty } from '@nestjs/swagger';
import { SearchParam } from '@zilliz/milvus2-sdk-node/dist/milvus/types';

enum VectorTypes {
  Binary = DataType.BinaryVector,
  Float = DataType.FloatVector,
}
export class CreateCollection {
  @ApiProperty({
    description: 'Milvus collection name',
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
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({
    message: 'fields is empty',
  })
  readonly fields: FieldType[];
}

export class ShowCollections {
  @ApiProperty({
    description: 'Type allow all->0 inmemory->1',
    enum: ShowCollectionsType,
  })
  @IsOptional()
  @IsEnum(ShowCollectionsType, { message: 'Type allow all->0 inmemory->1' })
  readonly type: ShowCollectionsType;
}

export class InsertData {
  @ApiProperty({
    description: 'Partition in this collection',
  })
  @IsOptional()
  readonly partition_names: string[];

  @ApiProperty({
    description: 'The fields data in this collection',
    default: [{ vector: [1, 2, 3], a: 1, b: 2 }],
  })
  readonly fields_data: any[];
}

export class VectorSearch {
  @ApiProperty({
    description: 'Milvus collection name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  collection_name: string;

  @ApiProperty({
    description: 'Partition in this collection',
  })
  @IsOptional()
  partition_names?: string[];

  @ApiProperty({
    description: 'Non vector fields filter.',
  })
  @IsString()
  expr?: string;

  @ApiProperty({
    description: 'Vector search params',
    default: [{ key: 'metric_type', value: 'L2' }],
  })
  @IsObject()
  search_params: SearchParam;

  @ApiProperty({
    description: 'Searched vector value',
    default: [[1, 2, 3, 4]],
  })
  @IsArray()
  @ArrayMinSize(1)
  vectors: number[][];

  @ApiProperty({
    description:
      'Define what non vector fields you want return in search results',
    default: ['a', 'b'],
  })
  @IsArray()
  @IsOptional()
  output_fields?: string[];

  @ApiProperty({
    description: 'Only support 101(binary) or 100(float)',
    enum: VectorTypes,
  })
  @IsEnum(VectorTypes, { message: 'Type allow all->0 inmemory->1' })
  vector_type: DataType.BinaryVector | DataType.FloatVector;
}
