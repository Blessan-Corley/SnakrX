import { motion } from 'framer-motion';
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  Shield,
  User,
  Gamepad2,
  Ban,
  Crown,
  Mail,
  ArrowLeft,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { playClick } from '@/utils/sound';

/**
 * Terms of Service Page
 * Comprehensive terms and conditions for SnakrX
 */
const TermsPage = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <CheckCircle size={20} />,
      content: [
        {
          text: 'By accessing and using SnakrX ("the Game"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        },
        {
          text: 'These Terms of Service ("Terms") constitute a legally binding agreement between you and SnakrX regarding your use of the Game and all related services.'
        },
        {
          text: 'You must be at least 13 years old to use SnakrX. If you are under 18, you must have your parent or guardian read and agree to these Terms.'
        }
      ]
    },
    {
      id: 'game-rules',
      title: 'Game Rules and Conduct',
      icon: <Gamepad2 size={20} />,
      content: [
        {
          subtitle: 'Fair Play',
          text: 'You agree to play fairly and not use any cheats, hacks, bots, or automated tools that give you an unfair advantage. We have systems in place to detect and prevent cheating.'
        },
        {
          subtitle: 'Account Responsibility',
          text: 'You are responsible for maintaining the security of your account and all activities that occur under your account. Choose a strong password and do not share your account credentials.'
        },
        {
          subtitle: 'Prohibited Conduct',
          text: 'You may not engage in harassment, abuse, or inappropriate behavior toward other players. Respect the gaming community and maintain a positive environment for everyone.'
        },
        {
          subtitle: 'Multiple Accounts',
          text: 'Each person may have only one account. Creating multiple accounts to circumvent bans or gain unfair advantages is prohibited.'
        }
      ]
    },
    {
      id: 'user-accounts',
      title: 'User Accounts and Registration',
      icon: <User size={20} />,
      content: [
        {
          subtitle: 'Account Creation',
          text: 'To access certain features, you must create an account by providing accurate and complete information. You agree to update your information as necessary to keep it current.'
        },
        {
          subtitle: 'Username Policy',
          text: 'Your username must not be offensive, impersonate others, or violate any laws. We reserve the right to require you to change your username if it violates these guidelines.'
        },
        {
          subtitle: 'Account Security',
          text: 'You are solely responsible for protecting your account password and for all activities that happen under your account. Notify us immediately of any unauthorized use.'
        },
        {
          subtitle: 'Account Termination',
          text: 'You may terminate your account at any time by contacting us. We may terminate accounts that violate these Terms or remain inactive for extended periods.'
        }
      ]
    },
    {
      id: 'gameplay',
      title: 'Gameplay and Features',
      icon: <Crown size={20} />,
      content: [
        {
          subtitle: 'Game Modes',
          text: 'SnakrX offers multiple game modes including Classic, VS AI, and Multiplayer. Each mode has its own rules and scoring systems that you agree to abide by.'
        },
        {
          subtitle: 'Achievements and Scoring',
          text: 'The achievement system and scoring are designed to be fair and consistent. We reserve the right to adjust scoring or achievements to maintain game balance.'
        },
        {
          subtitle: 'Leaderboards',
          text: 'Leaderboard rankings are based on legitimate gameplay. Scores achieved through cheating or exploitation will be removed, and accounts may be banned.'
        },
        {
          subtitle: 'Game Updates',
          text: 'We may update, modify, or discontinue any aspect of the game at any time. We will provide reasonable notice for major changes that affect gameplay.'
        }
      ]
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      icon: <Shield size={20} />,
      content: [
        {
          subtitle: 'Game Content',
          text: 'All content in SnakrX, including graphics, sounds, code, and design, is owned by SnakrX or its licensors and is protected by copyright and other intellectual property laws.'
        },
        {
          subtitle: 'License to Use',
          text: 'We grant you a limited, non-exclusive, non-transferable license to use the Game for personal, non-commercial purposes in accordance with these Terms.'
        },
        {
          subtitle: 'Restrictions',
          text: 'You may not copy, modify, distribute, sell, or create derivative works based on the Game or any part of it without our explicit written permission.'
        },
        {
          subtitle: 'User-Generated Content',
          text: 'Any feedback, suggestions, or ideas you provide about the Game may be used by us without any obligation to compensate you.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy and Data',
      icon: <Shield size={20} />,
      content: [
        {
          subtitle: 'Data Collection',
          text: 'Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.'
        },
        {
          subtitle: 'Game Data',
          text: 'We collect and store game-related data such as scores, achievements, and gameplay statistics to provide and improve our services.'
        },
        {
          subtitle: 'Communications',
          text: 'By creating an account, you consent to receive communications from us regarding your account, game updates, and important notices.'
        }
      ]
    },
    {
      id: 'enforcement',
      title: 'Enforcement and Violations',
      icon: <Ban size={20} />,
      content: [
        {
          subtitle: 'Monitoring',
          text: 'We reserve the right to monitor gameplay, user behavior, and communications to ensure compliance with these Terms and maintain a positive gaming environment.'
        },
        {
          subtitle: 'Penalties',
          text: 'Violations of these Terms may result in warnings, temporary suspensions, or permanent bans. The severity of the penalty will depend on the nature and frequency of the violation.'
        },
        {
          subtitle: 'Appeals',
          text: 'If you believe your account was unfairly penalized, you may contact us to request a review. We will investigate appeals fairly and respond in a timely manner.'
        },
        {
          subtitle: 'Repeat Offenders',
          text: 'Users who repeatedly violate these Terms may face escalating penalties, including permanent account termination.'
        }
      ]
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers and Liability',
      icon: <AlertTriangle size={20} />,
      content: [
        {
          subtitle: 'Service Availability',
          text: 'SnakrX is provided "as is" without warranties. We do not guarantee that the service will be uninterrupted or error-free, though we strive to provide the best experience possible.'
        },
        {
          subtitle: 'Limitation of Liability',
          text: 'To the fullest extent permitted by law, SnakrX shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Game.'
        },
        {
          subtitle: 'Technical Issues',
          text: 'We are not responsible for any loss of progress, scores, or achievements due to technical issues, though we will make reasonable efforts to prevent and resolve such issues.'
        },
        {
          subtitle: 'Third-Party Services',
          text: 'The Game may integrate with third-party services. We are not responsible for the availability or functionality of these external services.'
        }
      ]
    },
    {
      id: 'modifications',
      title: 'Modifications to Terms',
      icon: <FileText size={20} />,
      content: [
        {
          subtitle: 'Updates',
          text: 'We reserve the right to modify these Terms at any time. When we make significant changes, we will notify you via email or through the Game interface.'
        },
        {
          subtitle: 'Acceptance of Changes',
          text: 'Your continued use of SnakrX after any modifications constitutes acceptance of the updated Terms. If you do not agree with the changes, you should stop using the Game.'
        },
        {
          subtitle: 'Notification',
          text: 'We will update the "Last updated" date at the top of these Terms when changes are made. We recommend reviewing these Terms periodically.'
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
              'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
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
              <Scale className="inline mr-3 text-orange-400" size={48} />
              Terms of Service
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Please read these terms carefully before using SnakrX. They govern your use of our game and services.
            </p>
            <div className="mt-4 text-white/50 text-sm">
              Last updated: December 2024
            </div>
          </div>
        </motion.div>

        {/* Quick Overview */}
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
                <h2 className="text-xl font-bold text-white mb-3">Quick Overview</h2>
                <div className="text-white/90 space-y-2">
                  <p>• By using SnakrX, you agree to play fairly and respectfully</p>
                  <p>• One account per person, keep your credentials secure</p>
                  <p>• No cheating, hacking, or automated tools allowed</p>
                  <p>• We reserve the right to enforce these terms to maintain a positive gaming environment</p>
                  <p>• Contact us if you have questions or need to report violations</p>
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
                      {item.subtitle && (
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {item.subtitle}
                        </h3>
                      )}
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
          transition={{ delay: 1.0 }}
          className="mt-12 space-y-6"
        >
          {/* Governing Law */}
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Scale className="text-blue-400 mr-3" size={24} />
              Governing Law
            </h2>
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction where SnakrX operates, without regard to conflict of law provisions.
              </p>
              <p className="text-white/80 leading-relaxed">
                Any disputes arising from these Terms or your use of SnakrX shall be resolved through binding arbitration or in the courts of our jurisdiction.
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Mail className="text-green-400 mr-3" size={24} />
              Questions or Violations?
            </h2>
            <div className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                If you have questions about these Terms or need to report a violation, please contact us:
              </p>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white font-medium">Email: blessancorley@gmail.com</p>
                <p className="text-white/70 text-sm mt-1">
                  We respond to all inquiries within 24-48 hours.
                </p>
              </div>
              <p className="text-white/70 text-sm">
                When reporting violations, please provide as much detail as possible including usernames, dates, and description of the incident.
              </p>
            </div>
          </Card>

          {/* Severability */}
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FileText className="text-purple-400 mr-3" size={24} />
              Final Provisions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Severability</h3>
                <p className="text-white/80 leading-relaxed">
                  If any part of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Entire Agreement</h3>
                <p className="text-white/80 leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and SnakrX regarding the use of our service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Waiver</h3>
                <p className="text-white/80 leading-relaxed">
                  Our failure to enforce any provision of these Terms shall not constitute a waiver of that provision or any other provision.
                </p>
              </div>
            </div>
          </Card>

          {/* Legal Links */}
          <div className="text-center py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button 
                variant="ghost-primary" 
                onClick={() => {
                  playClick();
                  window.location.href = '/privacy';
                }}
              >
                Privacy Policy
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

export default TermsPage;