import notifee, { TriggerType, TimestampTrigger, AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { Reminder } from '@applyalert/contracts';
import { Platform } from 'react-native';

const CHANNEL_ID = 'opportunity-reminders';

export class NotificationScheduler {
  private static async ensureChannel() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Opportunity Reminders',
        description: 'Reminders for upcoming opportunity deadlines',
        importance: AndroidImportance.HIGH,
      });
    }
  }

  static async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
  }

  static async checkPermission(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
  }

  static async schedule(reminder: Reminder, title: string, body: string) {
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      console.warn('Cannot schedule notification: permission not granted');
      return;
    }

    await this.ensureChannel();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: new Date(reminder.scheduledFor).getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id: reminder.id,
        title,
        body,
        data: {
          opportunityId: reminder.opportunityId,
          reminderId: reminder.id,
        },
        android: {
          channelId: CHANNEL_ID,
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  }

  static async cancel(reminderId: string) {
    await notifee.cancelTriggerNotification(reminderId);
  }

  static async cancelForOpportunity(_opportunityId: string) {
    // We rely on cancelMultiple by explicit reminder IDs
  }

  static async cancelMultiple(reminderIds: string[]) {
    if (reminderIds.length > 0) {
      await notifee.cancelTriggerNotifications(reminderIds);
    }
  }
}
