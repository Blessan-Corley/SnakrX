import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { supportOperations } from '@/services/firebase/support.js';
import { playClick } from '@/utils/sound';
import {
  buildSupportEmailUrl,
  buildSupportWhatsAppUrl,
  openSupportContactUrl
} from './supportContactActions.js';
import {
  buildInitialSupportFormData,
  buildSupportCategoryLabelMap,
  mergeSupportIdentityFields,
  validateSupportFormData
} from './supportFormState.js';
import useSupportTicketState from './useSupportTicketState.js';
import { validateSupportAttachments } from '@/services/firebase/supportAttachments.js';

const useSupportPageController = ({ categoryOptions }) => {
  const { user, userProfile } = useAuth();
  const formSectionRef = useRef(null);
  const [formData, setFormData] = useState(() => buildInitialSupportFormData({ user, userProfile }));
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    loadingTickets,
    loadUserTickets,
    markingSeen,
    markTicketSeen,
    unreadTicketCount,
    userTickets
  } = useSupportTicketState({ userId: user?.uid });

  const categoryLabelMap = useMemo(
    () => buildSupportCategoryLabelMap(categoryOptions),
    [categoryOptions]
  );

  useEffect(() => {
    setFormData((previous) => mergeSupportIdentityFields(previous, { user, userProfile }));
  }, [user, userProfile]);

  const handleBack = useCallback(() => {
    playClick();
    window.history.back();
  }, []);

  const handleEmailContact = useCallback((subject = '') => {
    openSupportContactUrl(buildSupportEmailUrl(subject));
    playClick();
  }, []);

  const handleWhatsAppContact = useCallback((message = 'I need help with SnakrX.') => {
    openSupportContactUrl(buildSupportWhatsAppUrl(message));
    playClick();
  }, []);

  const updateField = useCallback((key, value) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  }, []);

  const openSupportForm = useCallback(({ category, title = '', description = '' }) => {
    setFormData((previous) => ({
      ...previous,
      category,
      title,
      description
    }));
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    playClick();
  }, []);

  const handleAttachmentChange = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    const validation = validateSupportAttachments(files);
    if (!validation.valid) {
      toast.error(validation.error);
      event.target.value = '';
      return;
    }
    setAttachments(files);
  }, []);

  const handleFormReset = useCallback(() => {
    setFormData(buildInitialSupportFormData({ user, userProfile }));
    setAttachments([]);
  }, [user, userProfile]);

  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!validateSupportFormData(formData)) {
      toast.error('Please provide your email and issue description.');
      return;
    }

    try {
      setSubmitting(true);
      await supportOperations.submitTicket(
        {
          uid: user?.uid,
          email: user?.email,
          username: userProfile?.username,
          displayName: userProfile?.displayName
        },
        {
          ...formData,
          attachmentFiles: attachments,
          attachmentNames: attachments.map((file) => file.name),
          source: 'support_page'
        }
      );
      toast.success('Support request sent successfully.');
      handleFormReset();
      await loadUserTickets();
    } catch {
      toast.error('Could not send support request right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [attachments, formData, handleFormReset, loadUserTickets, user, userProfile]);

  return {
    attachments,
    categoryLabelMap,
    formData,
    formSectionRef,
    handleAttachmentChange,
    handleBack,
    handleEmailContact,
    handleFormReset,
    handleFormSubmit,
    handleMarkTicketSeen: markTicketSeen,
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
  };
};

export default useSupportPageController;
