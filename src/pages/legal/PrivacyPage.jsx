import PublicPageLayout from '@/components/layout/PublicPageLayout.jsx';
import { playClick } from '@/utils/sound.js';
import PrivacyAnimatedBackground from './privacy/PrivacyAnimatedBackground.jsx';
import {
  policyUpdateSteps,
  privacyLastUpdated,
  privacySections,
  quickSummaryPoints
} from './privacy/privacyContent.js';
import PrivacyFooterCards from './privacy/PrivacyFooterCards.jsx';
import PrivacyHeader from './privacy/PrivacyHeader.jsx';
import PrivacyQuickSummaryCard from './privacy/PrivacyQuickSummaryCard.jsx';
import PrivacySectionsList from './privacy/PrivacySectionsList.jsx';

const navigateWithSound = (path) => {
  playClick();
  window.location.href = path;
};

const PrivacyPage = () => (
  <PublicPageLayout background={<PrivacyAnimatedBackground />} maxWidth="max-w-4xl">
    <PrivacyHeader
      lastUpdated={privacyLastUpdated}
      onBack={() => navigateWithSound('/')}
    />

    <PrivacyQuickSummaryCard points={quickSummaryPoints} />

    <PrivacySectionsList sections={privacySections} />

    <PrivacyFooterCards
      onNavigate={navigateWithSound}
      policyUpdateSteps={policyUpdateSteps}
    />
  </PublicPageLayout>
);

export default PrivacyPage;
