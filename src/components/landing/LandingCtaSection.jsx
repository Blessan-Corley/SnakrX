import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

const LandingCtaSection = ({ onAction }) => {
  return (
    <motion.section className="relative z-10 px-6 py-20 text-center">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Gaming?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join thousands of players enjoying the ultimate snake gaming experience
          </p>
          <Link to="/register">
            <Button
              variant="primary"
              size="xl"
              icon={<ArrowRight size={24} />}
              iconPosition="right"
              onClick={onAction}
              className="text-xl px-12 py-6"
            >
              Play SnakrX Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default LandingCtaSection;
