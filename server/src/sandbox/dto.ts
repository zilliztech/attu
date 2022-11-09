import { IsString } from 'class-validator';

export class CodeStringDto {
  @IsString({
    each: true,
  })
  readonly code: string[];
}
