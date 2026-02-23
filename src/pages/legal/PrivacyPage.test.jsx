import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyPage from './PrivacyPage.jsx';

vi.mock('@/components/layout/Footer.jsx', () => ({
  default: () => <div data-testid="privacy-page-footer" />
}));

describe('PrivacyPage', () => {
  it('renders core privacy policy content sections', () => {
    render(<PrivacyPage />);

    expect(screen.getByRole('heading', { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/We do not sell your personal information/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Information We Collect/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Policy Updates/i })).toBeInTheDocument();
    expect(screen.getByTestId('privacy-page-footer')).toBeInTheDocument();
  });
});
