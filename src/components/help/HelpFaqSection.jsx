import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Card from '@/components/ui/Card';

const HelpFaqSection = ({
  faqs,
  expandedFaq,
  onToggleFaq,
}) => (
  <Card variant="glass" padding="lg" className="mt-8">
    <h3 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h3>
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div key={faq.question} className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => onToggleFaq(index)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
          >
            <span className="font-medium text-white">{faq.question}</span>
            <motion.div
              animate={{ rotate: expandedFaq === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-white/60" />
            </motion.div>
          </button>
          <AnimatePresence>
            {expandedFaq === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 pb-4 text-white/70 border-t border-white/10">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  </Card>
);

export default HelpFaqSection;
