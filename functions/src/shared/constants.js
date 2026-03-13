const OTP_COLLECTION = 'emailOtps';
const OTP_RATE_LIMITS = 'otpRateLimits';
const SUPPORT_COLLECTION = 'supportTickets';
const SUPPORT_RATE_LIMITS = 'supportRateLimits';
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_IP_REQUESTS_PER_HOUR = 20;
const MAX_IP_VERIFY_PER_HOUR = 30;
const MAX_SUPPORT_SUBMISSIONS_PER_HOUR = 6;
const MAX_SUPPORT_IP_SUBMISSIONS_PER_HOUR = 20;
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const SUPPORT_ATTACHMENT_MAX_COUNT = 3;
const SUPPORT_ATTACHMENT_MAX_BYTES = 2 * 1024 * 1024;
const SUPPORT_ATTACHMENT_TOTAL_BYTES = SUPPORT_ATTACHMENT_MAX_COUNT * SUPPORT_ATTACHMENT_MAX_BYTES;
const SUPPORT_ATTACHMENT_ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json'
]);
const SUPPORT_TICKET_STATUSES = new Set(['open', 'in_progress', 'pending_user', 'resolved', 'closed']);
const SUPPORT_TICKET_PRIORITIES = new Set(['normal', 'high', 'urgent']);
const SUPPORT_TICKET_CATEGORIES = new Set([
  'bug_report',
  'gameplay_support',
  'achievement_issue',
  'score_sync',
  'password_reset',
  'username_change',
  'account_deletion',
  'account_recovery',
  'privacy_request',
  'other'
]);
const WEEKLY_LEADERBOARD_COLLECTION = 'weeklyLeaderboards';
const WEEKLY_LEADERBOARD_JOB_COLLECTION = 'weeklyLeaderboardJobs';
const WEEKLY_LEADERBOARD_META_DOC = 'meta';
const WEEKLY_LEADERBOARD_LIMIT = 100;
const WEEKLY_ACHIEVEMENT_RULES = [
  { id: 'weekly_top_100', statKey: 'weeklyLeaderboardTop100Finishes', target: 1, points: 20 },
  { id: 'weekly_top_10', statKey: 'weeklyLeaderboardTop10Finishes', target: 1, points: 40 },
  { id: 'weekly_top_3', statKey: 'weeklyLeaderboardTop3Finishes', target: 1, points: 75 },
  { id: 'weekly_rank_1', statKey: 'weeklyLeaderboardRank1Finishes', target: 1, points: 120 },
  { id: 'weekly_overall_top_10', statKey: 'weeklyOverallTop10Finishes', target: 1, points: 90 },
  { id: 'weekly_podium_streak', statKey: 'weeklyTop3BestWeekStreak', target: 3, points: 140 }
];

module.exports = {
  OTP_COLLECTION,
  OTP_RATE_LIMITS,
  SUPPORT_COLLECTION,
  SUPPORT_RATE_LIMITS,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_REQUESTS_PER_HOUR,
  MAX_VERIFY_ATTEMPTS,
  MAX_IP_REQUESTS_PER_HOUR,
  MAX_IP_VERIFY_PER_HOUR,
  MAX_SUPPORT_SUBMISSIONS_PER_HOUR,
  MAX_SUPPORT_IP_SUBMISSIONS_PER_HOUR,
  AVATAR_MAX_BYTES,
  AVATAR_ALLOWED_TYPES,
  SUPPORT_ATTACHMENT_MAX_COUNT,
  SUPPORT_ATTACHMENT_MAX_BYTES,
  SUPPORT_ATTACHMENT_TOTAL_BYTES,
  SUPPORT_ATTACHMENT_ALLOWED_TYPES,
  SUPPORT_TICKET_STATUSES,
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_CATEGORIES,
  WEEKLY_LEADERBOARD_COLLECTION,
  WEEKLY_LEADERBOARD_JOB_COLLECTION,
  WEEKLY_LEADERBOARD_META_DOC,
  WEEKLY_LEADERBOARD_LIMIT,
  WEEKLY_ACHIEVEMENT_RULES
};
