import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { playClick } from '@/utils/sound.js';

const LoginPageLinks = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.4 }}
    className="text-center space-y-4"
  >
    <Link
      to="/forgot-password"
      onClick={playClick}
      className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
    >
      Forgot your password?
    </Link>

    <div className="flex items-center justify-center space-x-2 text-white/70">
      <span className="text-sm">Don&apos;t have an account?</span>
      <Link
        to="/register"
        onClick={playClick}
        className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
      >
        Create Account
      </Link>
    </div>

    <div className="pt-4 border-t border-white/10">
      <Link
        to="/landing"
        onClick={playClick}
        className="text-white/50 hover:text-white/70 text-sm transition-colors"
      >
        Back to Landing
      </Link>
    </div>
  </motion.div>
);

export default LoginPageLinks;
