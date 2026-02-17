import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const SupportAccountManagementSection = ({ actions, onOpenSupportForm }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 }}
    className="mb-12"
  >
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Account Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <div key={action.id} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${action.iconBackgroundClassName} flex items-center justify-center`}>
                <Icon className={action.iconClassName} size={24} />
              </div>
              <h3 className="font-semibold text-white mb-2">{action.title}</h3>
              <p className="text-white/70 text-sm mb-4">{action.description}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenSupportForm({
                  category: action.id,
                  title: action.formTitle
                })}
              >
                {action.buttonLabel}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  </motion.div>
);

export default SupportAccountManagementSection;
