import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateReminderPlan, ReminderPreferences, DeadlineInput } from './reminder-generator';
import { Reminder } from '@applyalert/contracts';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async generateRemindersForOpportunity(opportunityId: string, userId: string, preferences: ReminderPreferences): Promise<Reminder[]> {
    const opp = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId, userId },
      include: { deadline: true, reminders: true },
    });

    if (!opp || !opp.deadline) return [];

    const deadlineInput: DeadlineInput = {
      kind: opp.deadline.kind,
      userConfirmed: opp.deadline.userConfirmed,
      utcInstant: opp.deadline.utcInstant?.toISOString(),
      localDate: opp.deadline.localDate ?? undefined,
      timezone: opp.deadline.timezone ?? undefined,
    };

    const newPlan = generateReminderPlan(opportunityId, userId, deadlineInput, new Date(), preferences);

    // Reconcile: we want to cancel existing future reminders that are no longer part of the plan.
    // In a sophisticated system, we might match on `type`. For now, if deadline changed, 
    // it's safer to cancel all PENDING/SCHEDULED reminders and create new ones.
    const existing = opp.reminders.filter(r => r.status === 'PENDING' || r.status === 'SCHEDULED');
    
    if (existing.length > 0) {
      await this.prisma.reminder.updateMany({
        where: { id: { in: existing.map(r => r.id) } },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
    }

    if (newPlan.length === 0) {
      return [];
    }

    const created = await this.prisma.$transaction(
      newPlan.map(plan => 
        this.prisma.reminder.create({
          data: {
            id: uuidv4(),
            userId: plan.userId,
            opportunityId: plan.opportunityId,
            type: plan.type,
            status: plan.status,
            channel: plan.channel,
            scheduledFor: new Date(plan.scheduledFor),
          }
        })
      )
    );

    return created as unknown as Reminder[];
  }

  async cancelRemindersForOpportunity(opportunityId: string, userId: string): Promise<void> {
    await this.prisma.reminder.updateMany({
      where: {
        opportunityId,
        userId,
        status: { in: ['PENDING', 'SCHEDULED'] }
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });
  }

  async getReminders(userId: string, opportunityId?: string): Promise<Reminder[]> {
    const where: any = { userId };
    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    const reminders = await this.prisma.reminder.findMany({
      where,
      orderBy: { scheduledFor: 'asc' },
    });
    
    return reminders as unknown as Reminder[];
  }
}
