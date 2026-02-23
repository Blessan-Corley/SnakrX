import { createElement } from 'react';
import {
  Award,
  Gamepad2,
  HelpCircle,
  Keyboard,
  Settings,
  Shield,
  Target,
} from 'lucide-react';

export const getHelpSections = () => ([
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: createElement(Gamepad2, { size: 20 }),
    color: 'text-green-400'
  },
  {
    id: 'game-modes',
    title: 'Game Modes',
    icon: createElement(Target, { size: 20 }),
    color: 'text-blue-400'
  },
  {
    id: 'controls',
    title: 'Controls',
    icon: createElement(Keyboard, { size: 20 }),
    color: 'text-purple-400'
  },
  {
    id: 'achievements',
    title: 'Achievements',
    icon: createElement(Award, { size: 20 }),
    color: 'text-yellow-400'
  },
  {
    id: 'account',
    title: 'Account & Settings',
    icon: createElement(Settings, { size: 20 }),
    color: 'text-orange-400'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: createElement(Shield, { size: 20 }),
    color: 'text-red-400'
  }
]);

export const HELP_FAQS = [
  {
    question: 'How do I start playing SnakrX?',
    answer: 'Simply create an account, choose a game mode from the main menu, and start playing! Classic mode is perfect for beginners.'
  },
  {
    question: 'What are the different difficulty levels in VS AI mode?',
    answer: 'Easy is beginner-friendly, Medium is balanced, and Impossible is the toughest setting. Higher difficulties give more points per food.'
  },
  {
    question: 'Can I play multiplayer on mobile?',
    answer: 'Multiplayer mode is currently only available on desktop/laptop devices for the best experience with multiple players and proper controls.'
  },
  {
    question: 'How do achievements work?',
    answer: 'Achievements are unlocked automatically as you play. They have different tiers (Common, Uncommon, Rare, Epic, Legendary) and award points that contribute to your overall ranking.'
  },
  {
    question: 'Can I change my username?',
    answer: 'Currently, usernames cannot be changed after account creation. However, you can update your display name in your profile settings. If you must change your username with valid reason or need you can contact support for assistance. Check the Help & Support page for contact details.'
  },
  {
    question: 'Is my game progress saved?',
    answer: 'Yes! All your statistics, achievements, and progress are automatically saved to your account and synced across devices.'
  },
  {
    question: 'Why can’t I hear any sounds?',
    answer: 'Check if sound is enabled in your profile settings. Also ensure your browser allows audio and your device volume is up.'
  }
];

export const HELP_PAGE_TITLE_ICON = createElement(HelpCircle, {
  className: 'inline mr-3',
  size: 48
});
