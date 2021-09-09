import { Body, Controller, Put } from '@nestjs/common';
import { CronsService } from './crons.service';
import { ToggleCron } from './dto';

@Controller('crons')
export class CronsController {
  constructor(private cronsService: CronsService) {}

  @Put()
  async toggleCron(@Body() data: ToggleCron) {
    console.log(data);
    return await this.cronsService.toggleCronJobByName(data);
  }
}
