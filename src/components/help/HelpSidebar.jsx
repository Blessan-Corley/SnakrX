import { Mail } from 'lucide-react';
import Card from '@/components/ui/Card';

const HelpSidebar = ({ sections, activeSection, onSectionClick }) => (
  <div className="lg:col-span-1">
    <Card variant="glass" padding="sm">
      <h3 className="text-lg font-semibold text-white mb-4">Topics</h3>
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={`
              w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200
              ${activeSection === section.id
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <span className={section.color}>{section.icon}</span>
            <span className="font-medium">{section.title}</span>
          </button>
        ))}
      </nav>
    </Card>

    <Card variant="glass" padding="sm" className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-3">Need More Help?</h3>
      <p className="text-white/70 text-sm mb-4">
        Can&apos;t find what you&apos;re looking for? Get in touch!
      </p>
      <a
        href="mailto:snakrxgame@gmail.com?subject=SnakrX Support"
        className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
      >
        <Mail size={16} />
        <span>Contact Support</span>
      </a>
    </Card>
  </div>
);

export default HelpSidebar;
