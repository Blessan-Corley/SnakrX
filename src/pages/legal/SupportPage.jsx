import PublicPageLayout from '@/components/layout/PublicPageLayout.jsx';
import SupportPageBackground from '@/components/support/SupportPageBackground.jsx';
import SupportPageHeader from '@/components/support/SupportPageHeader.jsx';
import SupportResponseTimeCard from '@/components/support/SupportResponseTimeCard.jsx';
import SupportContactMethodsSection from '@/components/support/SupportContactMethodsSection.jsx';
import SupportCategoriesSection from '@/components/support/SupportCategoriesSection.jsx';
import SupportAccountManagementSection from '@/components/support/SupportAccountManagementSection.jsx';
import SupportRequestForm from '@/components/support/SupportRequestForm.jsx';
import SupportTicketsSection from '@/components/support/SupportTicketsSection.jsx';
import SupportEmergencyCard from '@/components/support/SupportEmergencyCard.jsx';
import {
  ACCOUNT_MANAGEMENT_ACTIONS,
  CONTACT_METHODS,
  SUPPORT_CATEGORIES,
  SUPPORT_FORM_CATEGORIES,
  SUPPORT_PAGE_HEADER_ICON,
  SUPPORT_PRIORITY_STYLES,
  SUPPORT_RESPONSE_TIME_ICONS,
  SUPPORT_STATUS_STYLES,
  SUPPORT_EMERGENCY_ICON
} from '@/components/support/supportData.js';
import useSupportPageController from './support/useSupportPageController.js';

/**
 * Support Page Component
 * Contact information and issue reporting for SnakrX
 */
const SupportPage = () => {
  const categoryOptions = SUPPORT_FORM_CATEGORIES;
  const {
    attachments,
    categoryLabelMap,
    formData,
    formSectionRef,
    handleAttachmentChange,
    handleBack,
    handleEmailContact,
    handleFormReset,
    handleFormSubmit,
    handleMarkTicketSeen,
    handleWhatsAppContact,
    loadingTickets,
    loadUserTickets,
    markingSeen,
    openSupportForm,
    submitting,
    unreadTicketCount,
    updateField,
    user,
    userTickets
  } = useSupportPageController({ categoryOptions });

  return (
    <PublicPageLayout background={<SupportPageBackground />} maxWidth="max-w-6xl">
      <SupportPageHeader
        HeaderIcon={SUPPORT_PAGE_HEADER_ICON}
        onBack={handleBack}
      />
      <SupportResponseTimeCard
        leftIcon={SUPPORT_RESPONSE_TIME_ICONS.left}
        rightIcon={SUPPORT_RESPONSE_TIME_ICONS.right}
      />
      <SupportContactMethodsSection
        contactMethods={CONTACT_METHODS}
        onEmailContact={() => handleEmailContact()}
        onWhatsAppContact={() => handleWhatsAppContact()}
      />
      <SupportCategoriesSection
        categories={SUPPORT_CATEGORIES}
        onOpenSupportForm={openSupportForm}
      />
      <SupportAccountManagementSection
        actions={ACCOUNT_MANAGEMENT_ACTIONS}
        onOpenSupportForm={openSupportForm}
      />
      <SupportRequestForm
        attachments={attachments}
        categoryOptions={categoryOptions}
        formData={formData}
        formSectionRef={formSectionRef}
        onAttachmentChange={handleAttachmentChange}
        onReset={handleFormReset}
        onSubmit={handleFormSubmit}
        onUpdateField={updateField}
        submitting={submitting}
      />
      {user?.uid && (
        <SupportTicketsSection
          categoryLabelMap={categoryLabelMap}
          loadingTickets={loadingTickets}
          markingSeen={markingSeen}
          onMarkTicketSeen={handleMarkTicketSeen}
          onRefreshTickets={loadUserTickets}
          priorityStyles={SUPPORT_PRIORITY_STYLES}
          statusStyles={SUPPORT_STATUS_STYLES}
          unreadTicketCount={unreadTicketCount}
          userTickets={userTickets}
        />
      )}
      <SupportEmergencyCard
        EmergencyIcon={SUPPORT_EMERGENCY_ICON}
        onEmailContact={handleEmailContact}
        onWhatsAppContact={handleWhatsAppContact}
      />

      <div className="h-8" />
    </PublicPageLayout>
  );
};

export default SupportPage;
