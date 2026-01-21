import { AlertTriangle, Gamepad2, Link2, Package, Wifi } from 'lucide-react';

const ERROR_MESSAGES = {
  array: {
    title: 'Game Data Error',
    description: 'There was an issue with the game data. This usually fixes itself by restarting the game.',
    icon: Gamepad2,
    color: 'text-blue-400'
  },
  firebase: {
    title: 'Connection Error',
    description: 'Unable to connect to game servers. Please check your internet connection and try again.',
    icon: Link2,
    color: 'text-orange-400'
  },
  network: {
    title: 'Network Error',
    description: 'Network connection failed. Please check your internet connection.',
    icon: Wifi,
    color: 'text-red-400'
  },
  import: {
    title: 'Loading Error',
    description: 'Failed to load game components. Refreshing the page should fix this.',
    icon: Package,
    color: 'text-purple-400'
  },
  unknown: {
    title: 'Unexpected Error',
    description: 'Something unexpected happened. Don\'t worry, it happens to the best of us!',
    icon: AlertTriangle,
    color: 'text-red-400'
  }
};

export const getErrorMessage = (errorType) => ERROR_MESSAGES[errorType] ?? ERROR_MESSAGES.unknown;
