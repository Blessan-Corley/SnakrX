/**
 * App Footer Component - V2 (Styling Fixed)
 * Contains credits, links, and legal information with improved visibility.
 *
 * @version 2.0.0
 */

import { Link } from 'react-router-dom';
import { LifeBuoy, Shield, FileText } from 'lucide-react';
import { playClick } from '@/utils/sound';
import SnakrXLogo from '@/components/ui/SnakrXLogo.jsx';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-surface/50 border-t border-white/10 mt-auto z-10 relative">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <SnakrXLogo
              className="justify-center md:justify-start mb-4"
              rotateOnHover
              size="sm"
              subtitle="Modern Snake Gaming"
              subtitleClassName="text-gray-500"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Play classic snake with modern twists. Challenge AI, compete with friends, and unlock achievements.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-right">
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col items-center md:items-end gap-3">
              <FooterLink to="/support" icon={<LifeBuoy size={14} />} label="Help & Support" />
              <FooterLink to="/privacy" icon={<Shield size={14} />} label="Privacy Policy" />
              <FooterLink to="/terms" icon={<FileText size={14} />} label="Terms & Conditions" />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <p className="text-center text-gray-500 text-sm">
            (c) {currentYear} SnakrX. All rights reserved.
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
    <LinkComponent {...linkProps} onClick={playClick} className="inline-flex items-center gap-2.5 py-1 text-gray-400 hover:text-white transition-colors duration-200 text-sm group">
      <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
      <span>{label}</span>
    </LinkComponent>
  );
};

export default Footer;
