import { motion } from 'framer-motion';
import { 
  Headphones, 
  Mail, 
  Phone, 
  AlertTriangle, 
  Bug,
  Shield,
  UserX,
  Key,
  Clock,
  CheckCircle,
  ArrowLeft,
  MessageSquare,
  HelpCircle,
  Settings
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { playClick } from '@/utils/sound';

/**
 * Support Page Component
 * Contact information and issue reporting for SnakrX
 */
const SupportPage = () => {
  const supportCategories = [
    {
      id: 'bugs',
      title: 'Bug Reports & Errors',
      description: 'Found a bug or experiencing game crashes? Let us know!',
      icon: <Bug size={24} />,
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
      description: 'Need help with your account, password, or username changes?',
      icon: <Shield size={24} />,
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
      description: 'Having trouble with game features or need help playing?',
      icon: <HelpCircle size={24} />,
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
      description: 'Other questions or feedback about SnakrX?',
      icon: <MessageSquare size={24} />,
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

  const contactMethods = [
    {
      method: 'Email',
      value: 'blessancorley@gmail.com',
      icon: <Mail size={20} />,
      primary: true,
      description: 'Best for detailed reports and account issues'
    },
    {
      method: 'Phone',
      value: '+91 9976768211',
      icon: <Phone size={20} />,
      primary: false,
      description: 'For urgent technical support only'
    }
  ];

  const handleEmailContact = (subject = '') => {
    const email = 'blessancorley@gmail.com';
    const mailtoUrl = `mailto:${email}?subject=SnakrX Support: ${subject}`;
    window.location.href = mailtoUrl;
    playClick();
  };

  const handlePhoneContact = () => {
    window.location.href = 'tel:+919976768211';
    playClick();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              icon={<ArrowLeft size={16} />}
              onClick={() => {
                playClick();
                window.history.back();
              }}
            >
              Back
            </Button>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Headphones className="inline mr-3 text-green-400" size={48} />
            Support Center
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Need help? We're here to assist you with any issues or questions about SnakrX
          </p>
        </motion.div>

        {/* Quick Response Promise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card variant="gradient" padding="lg">
            <div className="flex items-center justify-center space-x-4">
              <Clock className="text-white" size={32} />
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">24-Hour Response Guarantee</h2>
                <p className="text-white/90">
                  All support requests are resolved within 24 hours. We're committed to providing fast, reliable support!
                </p>
              </div>
              <CheckCircle className="text-white" size={32} />
            </div>
          </Card>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((contact, index) => (
              <motion.div
                key={contact.method}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  variant="glass" 
                  padding="lg" 
                  className={`text-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                    contact.primary ? 'ring-2 ring-primary-500/30' : ''
                  }`}
                  onClick={contact.method === 'Email' ? () => handleEmailContact() : handlePhoneContact}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${
                    contact.primary ? 'bg-primary-500' : 'bg-white/10'
                  } flex items-center justify-center text-white`}>
                    {contact.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{contact.method}</h3>
                  <p className="text-xl font-mono text-primary-400 mb-3">{contact.value}</p>
                  <p className="text-white/70 text-sm">{contact.description}</p>
                  {contact.primary && (
                    <div className="mt-3">
                      <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">How Can We Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card 
                  variant="glass" 
                  padding="lg" 
                  className={`h-full border ${category.borderColor} ${category.bgColor}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${category.color} mt-1`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {category.title}
                      </h3>
                      <p className="text-white/80 mb-4">
                        {category.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-white/90">Common Issues:</h4>
                        <ul className="text-sm text-white/70 space-y-1">
                          {category.examples.map((example, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-white/50 rounded-full" />
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEmailContact(category.title)}
                          className={`${category.color} hover:${category.bgColor}`}
                        >
                          Report {category.title}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Account Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Account Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Key className="text-yellow-400" size={24} />
                </div>
                <h3 className="font-semibold text-white mb-2">Password Reset</h3>
                <p className="text-white/70 text-sm mb-4">
                  Need to change your password? Email us with your username and we'll help you reset it securely.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmailContact('Password Reset Request')}
                >
                  Request Reset
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Settings className="text-blue-400" size={24} />
                </div>
                <h3 className="font-semibold text-white mb-2">Username Change</h3>
                <p className="text-white/70 text-sm mb-4">
                  Want to update your username? Contact us with your current username and preferred new one.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmailContact('Username Change Request')}
                >
                  Change Username
                </Button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <UserX className="text-red-400" size={24} />
                </div>
                <h3 className="font-semibold text-white mb-2">Account Deletion</h3>
                <p className="text-white/70 text-sm mb-4">
                  Want to delete your account? Email us and we'll permanently remove all your data within 24 hours.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmailContact('Account Deletion Request')}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <Card variant="glass" padding="lg" className="border-orange-500/30 bg-orange-500/10">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <AlertTriangle className="text-orange-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Urgent Technical Issues?</h3>
            </div>
            <p className="text-white/80 mb-4">
              If you're experiencing critical game-breaking bugs or urgent account security issues, 
              you can also call us directly for immediate assistance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                variant="primary"
                onClick={() => handleEmailContact('Urgent Technical Issue')}
                icon={<Mail size={18} />}
              >
                Email Support
              </Button>
              <Button
                variant="ghost"
                onClick={handlePhoneContact}
                icon={<Phone size={18} />}
              >
                Call: +91 9976768211
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-12 pt-8 border-t border-white/10"
        >
          <p className="text-white/60 text-sm">
            SnakrX Support Team • Available 24/7 • Response within 24 hours guaranteed
          </p>
          <p className="text-white/50 text-xs mt-2">
            For fastest response, please include your username, device information, and detailed description of the issue.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportPage;