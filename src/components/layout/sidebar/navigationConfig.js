import {
  Award,
  BarChart3,
  Gamepad2,
  HelpCircle,
  Home,
  Settings,
  Shield,
  Trophy,
  User,
  Users
} from 'lucide-react';

export const buildSidebarNavigation = ({
  isAdmin,
  pendingRequestsCount,
  uncollectedAchievementsCount
}) => {
  const sections = [
    {
      section: 'Main',
      items: [
        { icon: Home, label: 'Home', path: '/', color: 'text-blue-400' },
        { icon: Gamepad2, label: 'Play Game', path: '/game', color: 'text-green-400' },
        { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', color: 'text-yellow-400' },
        {
          icon: Award,
          label: 'Achievements',
          path: '/achievements',
          color: 'text-purple-400',
          hasNotification: uncollectedAchievementsCount > 0,
          notificationCount: uncollectedAchievementsCount
        }
      ]
    },
    {
      section: 'Account',
      items: [
        { icon: User, label: 'Profile', path: '/profile', color: 'text-cyan-400' },
        {
          icon: Users,
          label: 'Friends',
          path: '/friends',
          color: 'text-emerald-400',
          hasNotification: pendingRequestsCount > 0,
          notificationCount: pendingRequestsCount
        },
        { icon: Settings, label: 'Settings', path: '/profile?tab=settings', color: 'text-gray-400' },
        { icon: HelpCircle, label: 'Help & Support', path: '/help', color: 'text-orange-400' }
      ]
    }
  ];

  if (isAdmin) {
    sections.push({
      section: 'Admin',
      items: [
        { icon: Shield, label: 'Admin Panel', path: '/admin', color: 'text-red-400' },
        { icon: BarChart3, label: 'Analytics', path: '/admin?tab=analytics', color: 'text-pink-400' }
      ]
    });
  }

  return sections;
};
