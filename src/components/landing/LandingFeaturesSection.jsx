import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { LANDING_FEATURES } from './landingPageData';

const LandingFeaturesSection = ({ y2 }) => {
  return (
    <motion.section
      style={{ y: y2 }}
      className="relative z-10 px-6 py-20"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Game Features
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Discover what makes SnakrX the ultimate snake gaming experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LANDING_FEATURES.map((feature, index) => {
            const FeatureIcon = feature.Icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  variant="glass"
                  hover={true}
                  className="h-full text-center group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`
                      w-16 h-16 mx-auto mb-4 rounded-2xl
                      bg-gradient-to-br ${feature.gradient}
                      flex items-center justify-center text-white
                      shadow-lg group-hover:shadow-xl transition-shadow duration-300
                    `}
                  >
                    <FeatureIcon size={24} />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default LandingFeaturesSection;
