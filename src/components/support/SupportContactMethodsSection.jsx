import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const SupportContactMethodsSection = ({
  contactMethods,
  onEmailContact,
  onWhatsAppContact,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="mb-12"
  >
    <h2 className="text-2xl font-bold text-white text-center mb-6">Contact Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {contactMethods.map((contact, index) => {
        const Icon = contact.icon;

        return (
          <motion.div
            key={contact.method}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card
              variant="glass"
              padding="lg"
              clickable
              className={`text-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                contact.primary ? 'ring-2 ring-primary-500/30' : ''
              }`}
              onClick={contact.method === 'Email' ? onEmailContact : onWhatsAppContact}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${
                contact.primary ? 'bg-primary-500' : 'bg-white/10'
              } flex items-center justify-center text-white`}>
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{contact.method}</h3>
              <p className="text-xl font-semibold text-primary-400 mb-3">{contact.value}</p>
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
        );
      })}
    </div>
    <div className="max-w-4xl mx-auto mt-4 text-center text-white/70 text-sm">
      Primary contact: Blessan Corley | snakrxgame@gmail.com | WhatsApp
    </div>
  </motion.div>
);

export default SupportContactMethodsSection;
