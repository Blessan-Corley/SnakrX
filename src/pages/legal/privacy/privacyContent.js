export const privacyLastUpdated = 'February 2026';

export const quickSummaryPoints = [
  'We collect only what is needed for login, gameplay, and progress tracking.',
  'We do not sell your personal information.',
  'You can ask us to update or delete your account data.',
  'Security improves as the project evolves.'
];

export const privacySections = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    iconKey: 'database',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account, we collect your email address, username, and display name. This is needed to sign you in and show your profile.'
      },
      {
        subtitle: 'Game Data',
        text: 'We store your scores, achievements, and play history to track progress and improve gameplay.'
      },
      {
        subtitle: 'Device Information',
        text: 'We may log basic device or browser details to troubleshoot issues.'
      },
      {
        subtitle: 'Usage Analytics',
        text: 'We review basic usage trends to understand what is working and what needs improvement.'
      }
    ]
  },
  {
    id: 'how-we-use-information',
    title: 'How We Use Your Information',
    iconKey: 'eye',
    content: [
      {
        subtitle: 'Game Services',
        text: 'Your information is used to provide core game functionality, maintain your account, track your progress, and enable features like leaderboards and achievements.'
      },
      {
        subtitle: 'Personalization',
        text: 'We use your data to remember preferences and provide relevant features.'
      },
      {
        subtitle: 'Communication',
        text: 'We may email you about account security or important changes.'
      },
      {
        subtitle: 'Improvement',
        text: 'Anonymous usage data helps us find bugs and improve performance.'
      }
    ]
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing and Disclosure',
    iconKey: 'shield',
    content: [
      {
        subtitle: 'No Sale of Personal Data',
        text: 'We do not sell, rent, or trade your personal information to third parties for commercial purposes.'
      },
      {
        subtitle: 'Service Providers',
        text: 'We use Firebase/Google to run the app. They process data only for hosting, auth, and database services.'
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose information if required by law, court order, or to protect the rights, property, or safety of SnakrX, our users, or others.'
      },
      {
        subtitle: 'Public Information',
        text: 'Usernames, scores, and achievements may be visible on leaderboards. You can control some visibility in your profile.'
      }
    ]
  },
  {
    id: 'data-security',
    title: 'Data Security',
    iconKey: 'lock',
    content: [
      {
        subtitle: 'Encryption',
        text: 'Data sent between your device and our backend is encrypted in transit.'
      },
      {
        subtitle: 'Secure Storage',
        text: 'Data is stored in Firebase. We rely on Firebase security controls and improve our own rules over time.'
      },
      {
        subtitle: 'Access Controls',
        text: 'Access to project data is limited to the project owner and required service accounts.'
      },
      {
        subtitle: 'Security',
        text: 'SnakrX is early-stage, and security practices are improved as the product grows.'
      }
    ]
  },
  {
    id: 'your-rights',
    title: 'Your Privacy Rights',
    iconKey: 'checkCircle',
    content: [
      {
        subtitle: 'Access',
        text: 'You can access most of your information in your profile settings.'
      },
      {
        subtitle: 'Correction',
        text: 'You can update and correct your personal information at any time through your account settings or by contacting us.'
      },
      {
        subtitle: 'Deletion',
        text: 'You can request deletion of your account by contacting us.'
      },
      {
        subtitle: 'Data Portability',
        text: 'You can request a copy of your data if needed.'
      },
      {
        subtitle: 'Opt-Out',
        text: 'You can opt out of non-essential communications.'
      }
    ]
  },
  {
    id: 'cookies-tracking',
    title: 'Cookies and Tracking',
    iconKey: 'cookie',
    content: [
      {
        subtitle: 'Local Storage',
        text: 'We use browser local storage to save your game preferences, settings, and temporary game data for a better user experience.'
      },
      {
        subtitle: 'Analytics',
        text: 'We focus on logs needed for stability. If we add broader analytics later, this page will be updated.'
      },
      {
        subtitle: 'Essential Functionality',
        text: 'Some data storage is essential for the game to function properly, such as remembering your login status and game preferences.'
      },
      {
        subtitle: 'Control',
        text: 'You can control some of these settings through your browser preferences, though disabling certain features may affect game functionality.'
      }
    ]
  }
];

export const policyUpdateSteps = [
  'Update the "Last updated" date on this page',
  'Add an in-app notice when the change materially affects your data',
  'Email active users when required'
];
