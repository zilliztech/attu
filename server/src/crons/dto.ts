import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { WS_EVENTS_TYPE } from '../utils/Const';

export class ToggleCron {
  @ApiProperty({
    description: 'Cron job  name',
  })
  @IsString()
  @IsNotEmpty({
    message: 'Cron job name is empty',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Type allow start->0 stop->1',
    enum: WS_EVENTS_TYPE,
  })
  @IsEnum(WS_EVENTS_TYPE, { message: 'start -> 0, stop -> 1' })
  @IsNotEmpty({
    message: 'Toggle type is empty',
  })
  readonly type: WS_EVENTS_TYPE;
}
