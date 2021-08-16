import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  // used for check healthy after build finished
  @Get('healthy')
  async checkServer() {
    return { status: 200 };
  }
}
