import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import HelpFaqSection from './HelpFaqSection.jsx';
import HelpSectionContent from './HelpSectionContent.jsx';
import HelpSidebar from './HelpSidebar.jsx';
import { HELP_FAQS, getHelpSections } from './helpData.js';

describe('help components', () => {
  it('renders sidebar topics and triggers section changes', () => {
    const onSectionClick = vi.fn();

    render(
      <HelpSidebar
        sections={getHelpSections()}
        activeSection="getting-started"
        onSectionClick={onSectionClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Game Modes/i }));
    expect(onSectionClick).toHaveBeenCalledWith('game-modes');
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('expands faq answers', () => {
    render(
      <HelpFaqSection
        faqs={HELP_FAQS.slice(0, 1)}
        expandedFaq={0}
        onToggleFaq={vi.fn()}
      />
    );

    expect(screen.getByText(HELP_FAQS[0].answer)).toBeInTheDocument();
  });

  it('renders each help content section variant', () => {
    const sectionAssertions = [
      ['getting-started', 'Getting Started with SnakrX'],
      ['game-modes', 'Game Modes'],
      ['controls', 'Game Controls'],
      ['achievements', 'Achievement System'],
      ['account', 'Account & Settings'],
      ['troubleshooting', 'Troubleshooting']
    ];

    sectionAssertions.forEach(([activeSection, heading]) => {
      const { unmount } = render(
        <HelpSectionContent activeSection={activeSection} mobile={false} />
      );
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
      unmount();
    });
  });
});
