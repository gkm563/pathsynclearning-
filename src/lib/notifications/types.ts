export type AppNotification = {
  id: string;
  type: string;
  title: string;
  desc: string;
  message?: string;
  icon?: string | null;
  color?: string | null;
  bg?: string | null;
  bdr?: string | null;
  actionable?: boolean;
  read: boolean;
  time: string;
  teamName?: string;
};

export type NotificationSummary = {
  unreadCount: number;
  latestAt: string | null;
};

export type NotificationListPayload = NotificationSummary & {
  notifications: AppNotification[];
};

export type NotificationPreferences = {
  pushOn: boolean;
  productOn: boolean;
  emailOn: boolean;
};
