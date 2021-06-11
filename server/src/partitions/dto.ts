import { IsNotEmpty, IsString } from 'class-validator';

export class GetPartitionsInfo {
  @IsString()
  @IsNotEmpty({
    message: 'collection_name is empty',
  })
  readonly collection_name: string;
}
