import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Cookie,
  Mail,
  ArrowLeft,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { playClick } from '@/utils/sound';

/**
 * Privacy Policy Page
 * Comprehensive privacy policy for SnakrX
 */
const PrivacyPage = () => {
  const sections = [
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      icon: <Database size={20} />,
      content: [
        {
          subtitle: 'Account Information',
          text: 'When you create an account, we collect your email address, username, display name, and security question response. This information is necessary to provide you with a personalized gaming experience and account security.'
        },
        {
          subtitle: 'Game Data',
          text: 'We collect and store your game statistics, including scores, achievements, game mode preferences, and play history. This data helps us improve the game and provide you with meaningful progress tracking.'
        },
        {
          subtitle: 'Device Information',
          text: 'We may collect information about your device, browser type, and operating system to optimize game performance and ensure compatibility across different platforms.'
        },
        {
          subtitle: 'Usage Analytics',
          text: 'We collect anonymous usage data to understand how players interact with our game, which features are most popular, and where we can make improvements.'
        }
      ]
    },
    {
      id: 'how-we-use-information',
      title: 'How We Use Your Information',
      icon: <Eye size={20} />,
      content: [
        {
          subtitle: 'Game Services',
          text: 'Your information is used to provide core game functionality, maintain your account, track your progress, and enable features like leaderboards and achievements.'
        },
        {
          subtitle: 'Personalization',
          text: 'We use your data to personalize your gaming experience, remember your preferences, and provide relevant content and features.'
        },
        {
          subtitle: 'Communication',
          text: 'We may use your email address to send important account notifications, security alerts, or updates about the game. You can opt out of non-essential communications.'
        },
        {
          subtitle: 'Improvement',
          text: 'Anonymous usage data helps us identify bugs, optimize performance, and develop new features based on player behavior and preferences.'
        }
      ]
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing and Disclosure',
      icon: <Shield size={20} />,
      content: [
        {
          subtitle: 'No Sale of Personal Data',
          text: 'We do not sell, rent, or trade your personal information to third parties for commercial purposes.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We may share limited data with trusted service providers (like Firebase/Google) who help us operate the game infrastructure, but only as necessary to provide services.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information if required by law, court order, or to protect the rights, property, or safety of SnakrX, our users, or others.'
        },
        {
          subtitle: 'Public Information',
          text: 'Some information like usernames, scores, and achievements may be publicly displayed on leaderboards and in-game features. You can control some of these privacy settings in your profile.'
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Lock size={20} />,
      content: [
        {
          subtitle: 'Encryption',
          text: 'All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols.'
        },
        {
          subtitle: 'Secure Storage',
          text: 'Your data is stored on secure servers provided by Google Firebase, which implements robust security measures including encryption at rest.'
        },
        {
          subtitle: 'Access Controls',
          text: 'We implement strict access controls and authentication mechanisms to ensure only authorized personnel can access user data when necessary.'
        },
        {
          subtitle: 'Regular Security Audits',
          text: 'We regularly review and update our security practices to protect against unauthorized access, alteration, disclosure, or destruction of personal information.'
        }
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Privacy Rights',
      icon: <CheckCircle size={20} />,
      content: [
        {
          subtitle: 'Access',
          text: 'You have the right to access and review the personal information we have collected about you. You can view most of this information in your profile settings.'
        },
        {
          subtitle: 'Correction',
          text: 'You can update and correct your personal information at any time through your account settings or by contacting us.'
        },
        {
          subtitle: 'Deletion',
          text: 'You can request deletion of your account and associated data by contacting us. Note that some information may be retained for legal or operational purposes.'
        },
        {
          subtitle: 'Data Portability',
          text: 'You can request a copy of your data in a portable format. Contact us if you need to export your game data.'
        },
        {
          subtitle: 'Opt-Out',
          text: 'You can opt out of non-essential communications and certain data collection practices through your account settings.'
        }
      ]
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies and Tracking',
      icon: <Cookie size={20} />,
      content: [
        {
          subtitle: 'Local Storage',
          text: 'We use browser local storage to save your game preferences, settings, and temporary game data for a better user experience.'
        },
        {
          subtitle: 'Analytics',
          text: 'We use Google Analytics to understand how players use our game. This helps us improve performance and user experience.'
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<ArrowLeft size={16} />}
              onClick={() => {
                playClick();
                window.location.href = '/';
              }}
            >
              Back to Game
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <Shield className="inline mr-3 text-blue-400" size={48} />
              Privacy Policy
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="mt-4 text-white/50 text-sm">
              Last updated: December 2024
            </div>
          </div>
        </motion.div>

        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card variant="gradient" padding="lg">
            <div className="flex items-start space-x-4">
              <Info className="text-white mt-1" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white mb-3">Quick Summary</h2>
                <div className="text-white/90 space-y-2">
                  <p>• We collect only the information necessary to provide you with a great gaming experience</p>
                  <p>• Your data is stored securely and we never sell your personal information</p>
                  <p>• You have control over your data and can request access, correction, or deletion at any time</p>
                  <p>• We use industry-standard security measures to protect your information</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + sectionIndex * 0.1 }}
              id={section.id}
            >
              <Card variant="glass" padding="lg">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="text-primary-400 mr-3">{section.icon}</span>
                  {section.title}
                </h2>
                
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {item.subtitle}
                      </h3>
                      <p className="text-white/80 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact and Legal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 space-y-6"
        >
          {/* Contact Information */}
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Mail className="text-green-400 mr-3" size={24} />
              Contact Us
            </h2>
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                If you have any questions about this Privacy Policy, your personal data, or would like to exercise your privacy rights, please contact us:
              </p>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white font-medium">Email: blessancorley@gmail.com</p>
                <p className="text-white/70 text-sm mt-1">
                  We typically respond to privacy inquiries within 30 days.
                </p>
              </div>
            </div>
          </Card>

          {/* Updates and Changes */}
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <AlertTriangle className="text-amber-400 mr-3" size={24} />
              Policy Updates
            </h2>
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make significant changes, we will:
              </p>
              <ul className="text-white/80 space-y-2 ml-6">
                <li>• Notify you via email if you have an account with us</li>
                <li>• Update the "Last updated" date at the top of this policy</li>
                <li>• Provide a clear summary of changes when you next visit the game</li>
              </ul>
              <p className="text-white/80 leading-relaxed">
                Your continued use of SnakrX after any changes constitute acceptance of the updated Privacy Policy.
              </p>
            </div>
          </Card>

          {/* Legal Links */}
          <div className="text-center py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button 
                variant="ghost-primary" 
                onClick={() => {
                  playClick();
                  window.location.href = '/terms';
                }}
              >
                Terms of Service
              </Button>
              <Button 
                variant="ghost-primary" 
                onClick={() => {
                  playClick();
                  window.location.href = '/help';
                }}
              >
                Help & Support
              </Button>
              <a 
                href="mailto:blessancorley@gmail.com"
                onClick={() => playClick()}
              >
                <Button variant="ghost-primary">
                  Contact Us
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;