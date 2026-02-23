import { useMemo, useState } from 'react';
import { isMobile } from '@/utils/gameUtils';
import { playClick } from '@/utils/sound';
import HelpBackground from '@/components/help/HelpBackground.jsx';
import HelpFaqSection from '@/components/help/HelpFaqSection.jsx';
import HelpPageHeader from '@/components/help/HelpPageHeader.jsx';
import HelpSectionContent from '@/components/help/HelpSectionContent.jsx';
import HelpSidebar from '@/components/help/HelpSidebar.jsx';
import { getHelpSections, HELP_FAQS } from '@/components/help/helpData.js';

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const mobile = isMobile();
  const sections = useMemo(() => getHelpSections(), []);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    playClick();
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
    playClick();
  };

  return (
    <div className="min-h-screen relative">
      <HelpBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <HelpPageHeader />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <HelpSidebar
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />

          <div className="lg:col-span-3">
            <HelpSectionContent activeSection={activeSection} mobile={mobile} />
            <HelpFaqSection
              faqs={HELP_FAQS}
              expandedFaq={expandedFaq}
              onToggleFaq={toggleFaq}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
