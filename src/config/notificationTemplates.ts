export enum NotificationType {
  WELCOME_ELDER = 'WELCOME_ELDER',
  WELCOME_CARETAKER = 'WELCOME_CARETAKER',
  MEDICATION_CONFIRMATION_AM = 'MEDICATION_CONFIRMATION_AM',
  MEDICATION_CONFIRMATION_PM = 'MEDICATION_CONFIRMATION_PM',
  UNREGISTERED_USER = 'UNREGISTERED_USER',
  INVITE_FAMILY_FIRST = 'INVITE_FAMILY_FIRST',
  INVITE_FAMILY_SECOND = 'INVITE_FAMILY_SECOND'
}

interface NotificationTemplate {
  contentSid?: string;
  description: string;
}

export const notificationTemplates: Record<NotificationType, NotificationTemplate> = {
  [NotificationType.WELCOME_ELDER]: {
    contentSid: process.env.TWILIO_WELCOME_ELDER_CONTENT_SID!,
    description: 'Welcome message sent to new elderly users'
  },
  [NotificationType.WELCOME_CARETAKER]: {
    contentSid: process.env.TWILIO_WELCOME_CARETAKER_CONTENT_SID!,
    description: 'Welcome message sent to new caretaker users'
  },
  [NotificationType.MEDICATION_CONFIRMATION_AM]: {
    contentSid: process.env.TWILIO_MED_CONFIRMATION_AM_SID!,
    description: 'Morning medication confirmation check'
  },
  [NotificationType.MEDICATION_CONFIRMATION_PM]: {
    contentSid: process.env.TWILIO_MED_CONFIRMATION_PM_SID!,
    description: 'Evening medication confirmation check'
  },
  [NotificationType.UNREGISTERED_USER]: {
    description: 'Welcome message sent to unregistered users'
  },
  [NotificationType.INVITE_FAMILY_FIRST]: {
    description: 'First message in the invite family flow'
  },
  [NotificationType.INVITE_FAMILY_SECOND]: {
    description: 'Second message in the invite family flow'
  }
} 