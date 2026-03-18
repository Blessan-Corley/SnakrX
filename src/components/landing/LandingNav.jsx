import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import SnakrXLogo from '@/components/ui/SnakrXLogo.jsx';

const LandingNav = ({ onAction }) => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="relative z-50 px-6 py-4"
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }}>
          <SnakrXLogo rotateOnHover subtitle="Modern Snake Gaming" />
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
