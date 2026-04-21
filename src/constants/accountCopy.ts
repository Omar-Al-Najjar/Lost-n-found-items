import { Language } from '../types';

export type AccountCopy = {
  shortcutsTitle: string;
  notificationsShortcutTitle: string;
  notificationsShortcutDescription: string;
  myReportsShortcutTitle: string;
  myReportsShortcutDescription: string;
  openShortcut: string;
  unreadCountLabel: string;
  reportsCountLabel: string;
  notificationsTitle: string;
  notificationsSubtitle: string;
  markAllRead: string;
  notificationAll: string;
  notificationUnread: string;
  notificationMatches: string;
  notificationUpdates: string;
  notificationEmptyTitle: string;
  notificationEmptyDescription: string;
  notificationOpenReport: string;
  notificationRead: string;
  notificationUnreadStatus: string;
  myReportsTitle: string;
  myReportsSubtitle: string;
  myReportsSearchPlaceholder: string;
  myReportsAll: string;
  myReportsLost: string;
  myReportsFound: string;
  statusAll: string;
  statusOpen: string;
  statusMatching: string;
  statusResolved: string;
  activeReports: string;
  resolvedReports: string;
  viewsLabel: string;
  messagesLabel: string;
  lastUpdateLabel: string;
  openChat: string;
  markResolved: string;
  reopenReport: string;
  highlightedReport: string;
  reportsEmptyTitle: string;
  reportsEmptyDescription: string;
};

const accountCopy: Record<Language, AccountCopy> = {
  en: {
    shortcutsTitle: 'Quick access',
    notificationsShortcutTitle: 'Notifications',
    notificationsShortcutDescription: 'Track report updates, matches, and new messages.',
    myReportsShortcutTitle: 'My Reports',
    myReportsShortcutDescription: 'Review your active cases and keep them up to date.',
    openShortcut: 'Open',
    unreadCountLabel: 'unread',
    reportsCountLabel: 'reports',
    notificationsTitle: 'Notifications',
    notificationsSubtitle: 'Stay on top of report activity and respond faster.',
    markAllRead: 'Mark all as read',
    notificationAll: 'All',
    notificationUnread: 'Unread',
    notificationMatches: 'Matches',
    notificationUpdates: 'Updates',
    notificationEmptyTitle: 'No notifications found',
    notificationEmptyDescription: 'Try another filter or check back after new activity arrives.',
    notificationOpenReport: 'Open report',
    notificationRead: 'Read',
    notificationUnreadStatus: 'Unread',
    myReportsTitle: 'My Reports',
    myReportsSubtitle: 'Manage your lost and found reports in one calm view.',
    myReportsSearchPlaceholder: 'Search by title, place, or person...',
    myReportsAll: 'All',
    myReportsLost: 'Lost',
    myReportsFound: 'Found',
    statusAll: 'All status',
    statusOpen: 'Open',
    statusMatching: 'Matching',
    statusResolved: 'Returned',
    activeReports: 'Active reports',
    resolvedReports: 'Returned',
    viewsLabel: 'Views',
    messagesLabel: 'Messages',
    lastUpdateLabel: 'Last update',
    openChat: 'Open chat',
    markResolved: 'Handed to owner',
    reopenReport: 'Reopen',
    highlightedReport: 'From notifications',
    reportsEmptyTitle: 'No reports match this view',
    reportsEmptyDescription: 'Change the filters or clear the search to see more reports.',
  },
  ar: {
    shortcutsTitle: '\u0648\u0635\u0648\u0644 \u0633\u0631\u064a\u0639',
    notificationsShortcutTitle: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
    notificationsShortcutDescription: '\u062a\u0627\u0628\u0639 \u062a\u062d\u062f\u064a\u062b\u0627\u062a \u0627\u0644\u0628\u0644\u0627\u063a\u0627\u062a \u0648\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0627\u062a \u0648\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062c\u062f\u064a\u062f\u0629.',
    myReportsShortcutTitle: '\u0628\u0644\u0627\u063a\u0627\u062a\u064a',
    myReportsShortcutDescription: '\u0631\u0627\u062c\u0639 \u0628\u0644\u0627\u063a\u0627\u062a\u0643 \u0627\u0644\u0646\u0634\u0637\u0629 \u0648\u062d\u062f\u0651\u062b \u062d\u0627\u0644\u062a\u0647\u0627 \u0628\u0633\u0647\u0648\u0644\u0629.',
    openShortcut: '\u0641\u062a\u062d',
    unreadCountLabel: '\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621',
    reportsCountLabel: '\u0628\u0644\u0627\u063a\u0627\u062a',
    notificationsTitle: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
    notificationsSubtitle: '\u0627\u0628\u0642\u064e \u0645\u0637\u0644\u0639\u064b\u0627 \u0639\u0644\u0649 \u062d\u0631\u0643\u0629 \u0628\u0644\u0627\u063a\u0627\u062a\u0643 \u0648\u0627\u0633\u062a\u062c\u0628 \u0628\u0633\u0631\u0639\u0629.',
    markAllRead: '\u062a\u0639\u0644\u064a\u0645 \u0627\u0644\u0643\u0644 \u0643\u0645\u0642\u0631\u0648\u0621',
    notificationAll: '\u0627\u0644\u0643\u0644',
    notificationUnread: '\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621',
    notificationMatches: '\u0645\u0637\u0627\u0628\u0642\u0627\u062a',
    notificationUpdates: '\u062a\u062d\u062f\u064a\u062b\u0627\u062a',
    notificationEmptyTitle: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629',
    notificationEmptyDescription: '\u062c\u0631\u0651\u0628 \u0641\u0644\u062a\u0631\u064b\u0627 \u0622\u062e\u0631 \u0623\u0648 \u0639\u062f \u0644\u0627\u062d\u0642\u064b\u0627 \u0639\u0646\u062f \u0648\u0635\u0648\u0644 \u0646\u0634\u0627\u0637 \u062c\u062f\u064a\u062f.',
    notificationOpenReport: '\u0641\u062a\u062d \u0627\u0644\u0628\u0644\u0627\u063a',
    notificationRead: '\u0645\u0642\u0631\u0648\u0621',
    notificationUnreadStatus: '\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621',
    myReportsTitle: '\u0628\u0644\u0627\u063a\u0627\u062a\u064a',
    myReportsSubtitle: '\u0623\u062f\u0631 \u0628\u0644\u0627\u063a\u0627\u062a \u0627\u0644\u0645\u0641\u0642\u0648\u062f\u0627\u062a \u0648\u0627\u0644\u0645\u0648\u062c\u0648\u062f\u0627\u062a \u0645\u0646 \u0648\u0627\u062c\u0647\u0629 \u0648\u0627\u0636\u062d\u0629.',
    myReportsSearchPlaceholder: '\u0627\u0628\u062d\u062b \u0628\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0623\u0648 \u0627\u0644\u0645\u0643\u0627\u0646 \u0623\u0648 \u0627\u0644\u0634\u062e\u0635...',
    myReportsAll: '\u0627\u0644\u0643\u0644',
    myReportsLost: '\u0645\u0641\u0642\u0648\u062f',
    myReportsFound: '\u0645\u0639\u062b\u0648\u0631 \u0639\u0644\u064a\u0647',
    statusAll: '\u0643\u0644 \u0627\u0644\u062d\u0627\u0644\u0627\u062a',
    statusOpen: '\u0645\u0641\u062a\u0648\u062d',
    statusMatching: '\u062c\u0627\u0631\u064a \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629',
    statusResolved: '\u062a\u0645 \u0627\u0644\u0625\u0631\u062c\u0627\u0639',
    activeReports: '\u0627\u0644\u0628\u0644\u0627\u063a\u0627\u062a \u0627\u0644\u0646\u0634\u0637\u0629',
    resolvedReports: '\u0627\u0644\u0645\u064f\u0631\u062c\u0639\u0629',
    viewsLabel: '\u0627\u0644\u0645\u0634\u0627\u0647\u062f\u0627\u062a',
    messagesLabel: '\u0627\u0644\u0631\u0633\u0627\u0626\u0644',
    lastUpdateLabel: '\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b',
    openChat: '\u0641\u062a\u062d \u0627\u0644\u062f\u0631\u062f\u0634\u0629',
    markResolved: '\u062a\u0645 \u062a\u0633\u0644\u064a\u0645\u0647\u0627 \u0644\u0644\u0635\u0627\u062d\u0628',
    reopenReport: '\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0641\u062a\u062d',
    highlightedReport: '\u0627\u0644\u0642\u062f\u0648\u0645 \u0645\u0646 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
    reportsEmptyTitle: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u0644\u0627\u063a\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629',
    reportsEmptyDescription: '\u063a\u064a\u0651\u0631 \u0627\u0644\u0641\u0644\u0627\u062a\u0631 \u0623\u0648 \u0627\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b \u0644\u0631\u0624\u064a\u0629 \u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0628\u0644\u0627\u063a\u0627\u062a.',
  },
};

export function getAccountCopy(language: Language) {
  return accountCopy[language];
}
