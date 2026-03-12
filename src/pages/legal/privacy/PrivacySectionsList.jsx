import { motion } from 'framer-motion';
import Card from '@/components/ui/Card.jsx';
import { getPrivacySectionIcon } from './privacyIconMap.js';

const PrivacySectionsList = ({ sections }) => (
  <div className="space-y-8">
    {sections.map((section, sectionIndex) => {
      const SectionIcon = getPrivacySectionIcon(section.iconKey);

      return (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + sectionIndex * 0.1 }}
          id={section.id}
        >
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">
                <SectionIcon size={20} />
              </span>
              {section.title}
            </h2>

            <div className="space-y-6">
              {section.content.map((item) => (
                <div key={`${section.id}-${item.subtitle}`}>
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
      );
    })}
  </div>
);

export default PrivacySectionsList;
