/**
 * App Footer Component - V2 (Styling Fixed)
 * Contains credits, links, and legal information with improved visibility.
 *
 * @version 2.0.0
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Shield, FileText } from 'lucide-react';
import { playClick } from '@/utils/sound';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-surface/50 border-t border-white/10 mt-auto z-10 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }} className="text-3xl">
                🐍
              </motion.div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-sunset bg-clip-text text-transparent">SnakrX</h3>
                <p className="text-xs text-gray-500">Modern Snake Gaming</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience the classic snake game with modern twists. Challenge AI, compete with friends, and unlock achievements.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <FooterLink to="/help" icon={<FileText size={14} />} label="Help & Support" />
              <FooterLink to="/privacy" icon={<Shield size={14} />} label="Privacy Policy" />
              <FooterLink to="/terms" icon={<FileText size={14} />} label="Terms & Conditions" />
              <FooterLink to="mailto:blessancorley@gmail.com" icon={<Mail size={14} />} label="Contact Support" external />
            </div>
          </div>

          {/* Developer Credit */}
          <div className="text-center md:text-right">
            <h4 className="text-white font-semibold mb-4">Developer</h4>
            <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
              <div className="bg-gradient-card border border-white/20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-gray-300 text-sm mb-2">
                  Designed & Built with <Heart size={14} className="inline text-red-400 mx-1" /> by
                </p>
                <a href="https://github.com/Blessan-Corley" target="_blank" rel="noopener noreferrer" onClick={playClick} className="text-primary-400 hover:text-primary-300 font-medium text-lg transition-colors">
                  Blessan Corley
                </a>
                <p className="text-gray-500 text-xs mt-1">Full Stack Developer</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} SnakrX. All rights reserved. Built with React, Firebase & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, icon, label, external = false }) => {
  const LinkComponent = external ? 'a' : Link;
  const linkProps = external ? { href: to, target: '_blank', rel: 'noopener noreferrer' } : { to };

  return (
    <LinkComponent {...linkProps} onClick={playClick} className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm group">
      <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
      <span>{label}</span>
    </LinkComponent>
  );
};

export default Footer;
