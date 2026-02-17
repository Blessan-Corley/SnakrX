import {
  AlertTriangle,
  Bug,
  CheckCircle,
  Clock,
  Headphones,
  HelpCircle,
  Key,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  UserX,
} from 'lucide-react';

export const SUPPORT_CATEGORIES = [
  {
    id: 'bugs',
    title: 'Bug Reports & Errors',
    description: 'Found a bug or seeing crashes? Let us know.',
    icon: Bug,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    examples: [
      'Game crashes or freezes',
      'Error messages during gameplay',
      'Missing features or broken buttons',
      'Performance issues',
      'Loading problems'
    ]
  },
  {
    id: 'account',
    title: 'Account Issues',
    description: 'Help with your account, password, or username.',
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    examples: [
      'Password reset requests',
      'Username change requests',
      'Account deletion requests',
      'Login problems',
      'Profile issues'
    ]
  },
  {
    id: 'gameplay',
    title: 'Gameplay Support',
    description: 'Trouble with gameplay or settings.',
    icon: HelpCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    examples: [
      'Game controls not working',
      'Achievement not unlocking',
      'Multiplayer connection issues',
      'Score not saving',
      'Settings not working'
    ]
  },
  {
    id: 'general',
    title: 'General Inquiries',
    description: 'Questions or feedback about SnakrX.',
    icon: MessageSquare,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    examples: [
      'Feature requests',
      'General feedback',
      'Partnership inquiries',
      'Privacy questions',
      'Terms of service questions'
    ]
  }
];

export const SUPPORT_FORM_CATEGORIES = [
  { value: 'bug_report', label: 'Bug report' },
  { value: 'gameplay_support', label: 'Gameplay support' },
  { value: 'achievement_issue', label: 'Achievement issue' },
  { value: 'score_sync', label: 'Score or leaderboard sync issue' },
  { value: 'password_reset', label: 'Password reset request' },
  { value: 'username_change', label: 'Username change request' },
  { value: 'account_deletion', label: 'Account deletion request' },
  { value: 'account_recovery', label: 'Account recovery request' },
  { value: 'privacy_request', label: 'Privacy or data request' },
  { value: 'other', label: 'Other support request' }
];

export const SUPPORT_STATUS_STYLES = {
  open: 'bg-sky-500/15 text-sky-200 border border-sky-400/30',
  in_progress: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  pending_user: 'bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30',
  resolved: 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30',
  closed: 'bg-white/10 text-white/70 border border-white/15'
};

export const SUPPORT_PRIORITY_STYLES = {
  normal: 'bg-white/10 text-white/70 border border-white/15',
  high: 'bg-orange-500/15 text-orange-200 border border-orange-400/30',
  urgent: 'bg-red-500/15 text-red-200 border border-red-400/30'
};

export const CONTACT_METHODS = [
  {
    method: 'Email',
    value: 'snakrxgame@gmail.com',
    icon: Mail,
    primary: true,
    description: 'Best for detailed reports and account issues'
  },
  {
    method: 'WhatsApp',
    value: 'WhatsApp',
    icon: MessageSquare,
    primary: false,
    description: 'Quick support chat for follow-ups and general help'
  }
];

export const ACCOUNT_MANAGEMENT_ACTIONS = [
  {
    id: 'password_reset',
    title: 'Password Reset',
    description: 'Need to change your password? Email us with your username and we\'ll help you reset it securely.',
    icon: Key,
    iconClassName: 'text-yellow-400',
    iconBackgroundClassName: 'bg-yellow-500/20',
    buttonLabel: 'Request Reset',
    formTitle: 'Password reset request'
  },
  {
    id: 'username_change',
    title: 'Username Change',
    description: 'Want to update your username? Contact us with your current username and preferred new one.',
    icon: Settings,
    iconClassName: 'text-blue-400',
    iconBackgroundClassName: 'bg-blue-500/20',
    buttonLabel: 'Change Username',
    formTitle: 'Username change request'
  },
  {
    id: 'account_deletion',
    title: 'Account Deletion',
    description: 'Want to delete your account? Email us and we\'ll remove your account data, usually within 2-3 business days.',
    icon: UserX,
    iconClassName: 'text-red-400',
    iconBackgroundClassName: 'bg-red-500/20',
    buttonLabel: 'Delete Account',
    formTitle: 'Account deletion request'
  }
];

export const SUPPORT_PAGE_HEADER_ICON = Headphones;
export const SUPPORT_RESPONSE_TIME_ICONS = {
  left: Clock,
  right: CheckCircle
};
export const SUPPORT_EMERGENCY_ICON = AlertTriangle;
