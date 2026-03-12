const SUPPORT_EMAIL = 'snakrxgame@gmail.com';
const SUPPORT_WHATSAPP_NUMBER = '919976768211';

export const buildSupportEmailUrl = (subject = '') => (
  `mailto:${SUPPORT_EMAIL}?subject=SnakrX Support: ${subject}`
);

export const buildSupportWhatsAppUrl = (
  message = 'I need help with SnakrX.'
) => (
  `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
);

export const openSupportContactUrl = (url) => {
  window.open(url, '_self');
};
