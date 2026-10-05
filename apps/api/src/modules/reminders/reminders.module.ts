import { Module, Global } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController, GlobalRemindersController } from './reminders.controller';

@Global()
@Module({
  controllers: [RemindersController, GlobalRemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
