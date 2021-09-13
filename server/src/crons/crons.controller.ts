import { Body, Controller, Put } from '@nestjs/common';
import { CronsService } from './crons.service';
import { ToggleCron } from './dto';

@Controller('crons')
export class CronsController {
  constructor(private cronsService: CronsService) {}

  @Put()
  async toggleCron(@Body() data: ToggleCron) {
    return await this.cronsService.toggleCronJobByName(data);
  }
}
