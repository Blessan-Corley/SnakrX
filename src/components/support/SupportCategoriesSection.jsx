import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { mapSupportCategoryToFormCategory } from './supportUtils.js';

const SupportCategoriesSection = ({ categories, onOpenSupportForm }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="mb-12"
  >
    <h2 className="text-2xl font-bold text-white text-center mb-8">How Can We Help?</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((category, index) => {
        const Icon = category.icon;

        return (
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
                  <Icon size={24} />
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
                      {category.examples.map((example) => (
                        <li key={example} className="flex items-center space-x-2">
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
                      onClick={() => onOpenSupportForm({
                        category: mapSupportCategoryToFormCategory(category.id),
                        title: category.title
                      })}
                      className={`${category.color} hover:${category.bgColor}`}
                    >
                      Report {category.title}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

export default SupportCategoriesSection;
