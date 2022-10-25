import { IsString } from 'class-validator';

export class CodeStringDto {
  @IsString()
  readonly code: string;
}
