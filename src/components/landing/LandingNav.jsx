import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GamepadIcon } from 'lucide-react';
import Button from '@/components/ui/Button';

const LandingNav = ({ onAction }) => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="relative z-50 px-6 py-4"
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3"
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white"
          >
            <GamepadIcon size={20} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
              SnakrX
            </h1>
            <p className="text-xs text-white/50">Modern Snake Gaming</p>
          </div>
        </motion.div>

        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" onClick={onAction}>
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" onClick={onAction}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default LandingNav;
