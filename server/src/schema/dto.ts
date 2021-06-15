import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

class KeyValuePair {
  @ApiProperty()
  key: string;
  @ApiProperty()
  value: string;
}

export class CreateIndex {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: 'field_name is empty',
  })
  readonly field_name: string;

  @ApiProperty({
    type: [KeyValuePair],
  })
  @IsArray()
  readonly extra_params: KeyValuePair[];
}
