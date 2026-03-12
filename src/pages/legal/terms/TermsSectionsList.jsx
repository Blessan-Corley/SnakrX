import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const TermsSectionsList = ({ sections, iconMap }) => {
  return (
    <div className="space-y-8">
      {sections.map((section, sectionIndex) => {
        const SectionIcon = iconMap[section.icon];

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
                  {SectionIcon ? <SectionIcon size={20} /> : null}
                </span>
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
        );
      })}
    </div>
  );
};

export default TermsSectionsList;
