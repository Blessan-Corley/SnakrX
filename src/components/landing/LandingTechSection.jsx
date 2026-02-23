import { motion } from 'framer-motion';
import { LANDING_TECH_FEATURES } from './landingPageData';

const LandingTechSection = () => {
  return (
    <motion.section className="relative z-10 px-6 py-20">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Built for Performance
          </h2>
          <p className="text-xl text-white/70">
            Modern web technologies for the best gaming experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {LANDING_TECH_FEATURES.map((feature, index) => {
            const TechIcon = feature.Icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-sunset rounded-2xl flex items-center justify-center text-white">
                  <TechIcon size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default LandingTechSection;
