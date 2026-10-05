import { Controller, Get, Param, Request } from '@nestjs/common';
import { RemindersService } from './reminders.service';

// Basic Auth/Request mock for now
@Controller('opportunities/:opportunityId/reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  async getReminders(@Request() req: any, @Param('opportunityId') opportunityId: string) {
    const userId = req.user?.id || 'dev-user-1'; // dev fallback
    return this.remindersService.getReminders(userId, opportunityId);
  }
}

@Controller('reminders')
export class GlobalRemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  async getAllReminders(@Request() req: any) {
    const userId = req.user?.id || 'dev-user-1'; // dev fallback
    return this.remindersService.getReminders(userId);
  }
}
