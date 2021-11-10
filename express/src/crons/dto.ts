import { IsEnum, IsString } from "class-validator";
import { WS_EVENTS_TYPE } from "../utils/Const";

export class toggleCronJobByNameDto {
  @IsString()
  name: string;

  @IsEnum(WS_EVENTS_TYPE, { message: "Type allow start->0 stop->1" })
  type: WS_EVENTS_TYPE;
}
