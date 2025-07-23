import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Shield, FileText } from 'lucide-react';
import { playClick } from '@/utils/sound';

/**
 * App Footer Component
 * Contains credits, links, and legal information
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-surface/50 border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="text-3xl"
              >
                🐍
              </motion.div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                  SnakrX
                </h3>
                <p className="text-xs text-white/50">
                  Modern Snake Gaming
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Experience the classic snake game with modern twists. 
              Challenge AI, compete with friends, and unlock achievements 
              in this premium gaming experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <FooterLink to="/help" icon={<FileText size={14} />} label="Help & Support" />
              <FooterLink to="/privacy" icon={<Shield size={14} />} label="Privacy Policy" />
              <FooterLink to="/terms" icon={<FileText size={14} />} label="Terms & Conditions" />
              <FooterLink 
                to="mailto:blessancorley@gmail.com" 
                icon={<Mail size={14} />} 
                label="Contact Support" 
                external 
              />
            </div>
          </div>

          {/* Developer Credit */}
          <div className="text-center md:text-right">
            <h4 className="text-white font-semibold mb-4">Developer</h4>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-block"
            >
              <div className="bg-gradient-card border border-white/20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-white/80 text-sm mb-2">
                  Designed & Built with <Heart size={14} className="inline text-red-400 mx-1" /> by
                </p>
                <a
                  href="mailto:blessancorley@gmail.com"
                  onClick={() => playClick()}
                  className="text-primary-400 hover:text-primary-300 font-medium text-lg transition-colors"
                >
                  Blessan Corley
                </a>
                <p className="text-white/50 text-xs mt-1">
                  Full Stack Developer
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-white/60 text-sm text-center md:text-left">
              <p>© {currentYear} SnakrX. All rights reserved.</p>
              <p className="text-xs mt-1">
                Built with React, Firebase & Tailwind CSS
              </p>
            </div>

            {/* Game Stats */}
            <div className="flex items-center space-x-6 text-white/60 text-sm">
              <div className="text-center">
                <p className="text-white font-medium">v1.0.0</p>
                <p className="text-xs">Version</p>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">🎮</p>
                <p className="text-xs">Gaming</p>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">⚡</p>
                <p className="text-xs">Fast</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <motion.a
                href="mailto:blessancorley@gmail.com?subject=SnakrX Feedback"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playClick()}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
                aria-label="Email developer"
              >
                <Mail size={16} />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Easter Egg */}
        <div className="mt-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
            className="text-white/30 text-xs"
          >
            🐍 Made for gamers, by a gamer 🎮
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

/**
 * Footer Link Component
 */
const FooterLink = ({ to, icon, label, external = false, className = '' }) => {
  const LinkComponent = external ? 'a' : Link;
  const linkProps = external ? { href: to, target: '_blank', rel: 'noopener noreferrer' } : { to };

  return (
    <LinkComponent
      {...linkProps}
      onClick={() => playClick()}
      className={`
        inline-flex items-center space-x-2 text-white/70 hover:text-white 
        transition-colors duration-200 text-sm group
        ${className}
      `}
    >
      <span className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      <span>{label}</span>
    </LinkComponent>
  );
};

export default Footer;