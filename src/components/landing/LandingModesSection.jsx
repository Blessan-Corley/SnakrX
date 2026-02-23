import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { LANDING_GAME_MODES } from './landingPageData';

const LandingModesSection = () => {
  return (
    <motion.section className="relative z-10 px-6 py-20 bg-white/5">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Challenge
          </h2>
          <p className="text-xl text-white/70">
            Three exciting game modes to test your skills
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LANDING_GAME_MODES.map((mode, index) => {
            const ModeIcon = mode.Icon;
            return (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card variant="glass" className="text-center h-full">
                  <div className="flex items-center justify-center text-5xl mb-4 text-white">
                    <ModeIcon size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {mode.title}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {mode.description}
                  </p>
                  <div
                    className={`
                      h-2 rounded-full bg-gradient-to-r ${mode.color}
                      animate-pulse
                    `}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default LandingModesSection;
