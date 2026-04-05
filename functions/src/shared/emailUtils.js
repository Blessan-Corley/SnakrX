const { functions, nodemailer } = require('../runtime');
const { OTP_TTL_MS } = require('./constants');
const { escapeHtml, getRequiredEnv, sanitizeText } = require('./coreUtils');

let transporterInstance = null;
const EMAIL_THEME = {
  bodyBackground: '#08070c',
  shellGradient: 'linear-gradient(135deg, #120d0c 0%, #1a1328 48%, #0f172a 100%)',
  panelBackground: 'rgba(15, 23, 42, 0.78)',
  panelBorder: '1px solid rgba(249, 115, 22, 0.28)',
  panelInset: '0 0 0 1px rgba(255, 255, 255, 0.04) inset',
  textPrimary: '#f8fafc',
  textMuted: '#cbd5e1',
  textSubtle: '#94a3b8',
  accent: '#f97316',
  accentStrong: '#ea580c',
  accentSoft: 'rgba(249, 115, 22, 0.16)',
  cardBackground: 'rgba(15, 23, 42, 0.86)',
  cardBorder: '1px solid rgba(148, 163, 184, 0.18)',
  success: '#34d399',
  link: '#fdba74'
};

const getTransporter = () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  const user = getRequiredEnv('EMAIL_USER');
  const pass = getRequiredEnv('EMAIL_PASS').replace(/\s+/g, '');

  transporterInstance = nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    maxConnections: 1,
    maxMessages: Infinity,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: { user, pass }
  });

  return transporterInstance;
};

const getOtpSalt = () => {
  const salt = (process.env.OTP_SALT || '').trim();
  if (!salt) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'OTP verification is not configured. Please set OTP_SALT for Cloud Functions.'
    );
  }

  return salt;
};

const buildEmailShell = ({ eyebrow, title, subtitle, bodyHtml }) => `
  <div style="margin: 0; padding: 32px 16px; background: ${EMAIL_THEME.bodyBackground}; font-family: Arial, sans-serif; color: ${EMAIL_THEME.textPrimary};">
    <div style="max-width: 680px; margin: 0 auto; border-radius: 24px; overflow: hidden; background: ${EMAIL_THEME.shellGradient}; border: ${EMAIL_THEME.panelBorder}; box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48), ${EMAIL_THEME.panelInset};">
      <div style="padding: 24px 24px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="display: inline-block; margin: 0 0 14px; padding: 7px 12px; border-radius: 999px; background: ${EMAIL_THEME.accentSoft}; color: ${EMAIL_THEME.link}; font-size: 11px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase;">
          ${eyebrow}
        </div>
        <div style="font-size: 29px; font-weight: 800; line-height: 1.15; margin: 0 0 10px; color: ${EMAIL_THEME.textPrimary};">
          ${title}
        </div>
        <div style="font-size: 15px; line-height: 1.7; color: ${EMAIL_THEME.textMuted};">
          ${subtitle}
        </div>
      </div>
      <div style="padding: 22px 24px 26px;">
        ${bodyHtml}
      </div>
    </div>
  </div>
`;

const buildInfoRow = (label, value) => `
  <tr>
    <td style="padding: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${EMAIL_THEME.textSubtle}; vertical-align: top;">
      ${label}
    </td>
    <td style="padding: 0 0 10px; font-size: 14px; line-height: 1.6; color: ${EMAIL_THEME.textPrimary}; vertical-align: top;">
      ${value}
    </td>
  </tr>
`;

const buildCard = (content, extraStyles = '') => `
  <div style="margin: 0 0 16px; padding: 18px; border-radius: 18px; background: ${EMAIL_THEME.cardBackground}; border: ${EMAIL_THEME.cardBorder}; ${extraStyles}">
    ${content}
  </div>
`;

const buildOtpEmail = ({ code, expiresMinutes = Math.floor(OTP_TTL_MS / 60000) }) => {
  const subject = 'SnakrX verification code';
  const text = `Your SnakrX verification code is ${code}. It expires in ${expiresMinutes} minutes.`;

  const html = buildEmailShell({
    eyebrow: 'SnakrX Arena Access',
    title: 'Verify your email and enter the arena',
    subtitle: 'Enter this code in the SnakrX sign-up flow to finish creating your account.',
    bodyHtml: `
      ${buildCard(`
        <div style="margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: ${EMAIL_THEME.textSubtle};">
          Verification code
        </div>
        <div style="padding: 18px 16px; border-radius: 16px; background: linear-gradient(135deg, rgba(249, 115, 22, 0.22), rgba(15, 23, 42, 0.92)); border: 1px solid rgba(249, 115, 22, 0.32); text-align: center; font-size: 34px; letter-spacing: 0.3em; font-weight: 800; color: ${EMAIL_THEME.textPrimary};">
          ${code}
        </div>
        <div style="margin: 14px 0 0; font-size: 14px; line-height: 1.7; color: ${EMAIL_THEME.textMuted};">
          This code expires in ${expiresMinutes} minutes. If you did not request this, you can safely ignore this email.
        </div>
      `)}
      <div style="font-size: 13px; line-height: 1.7; color: ${EMAIL_THEME.textSubtle};">
        SnakrX never asks you to share this code with anyone. Keep it only inside the SnakrX website flow.
      </div>
    `
  });

  return { subject, text, html };
};

const buildSupportEmail = (ticket) => {
  const attachmentLines = Array.isArray(ticket.attachments) && ticket.attachments.length > 0
    ? ticket.attachments.map((attachment) => `- ${attachment.name}${attachment.url ? ` (${attachment.url})` : ''}`)
    : [];
  const attachmentSummary = attachmentLines.length > 0
    ? attachmentLines.join('\n')
    : ((ticket.attachmentNames || []).join(', ') || 'None');
  const subject = `[SnakrX Support] ${ticket.title}`;
  const text = [
    `Ticket ID: ${ticket.id}`,
    `Category: ${ticket.category}`,
    `Submitted: ${new Date(ticket.clientCreatedAt).toISOString()}`,
    `Name: ${ticket.displayName || 'Not provided'}`,
    `Username: ${ticket.username || 'Not provided'}`,
    `Email: ${ticket.email || 'Not provided'}`,
    `Device: ${ticket.device || 'Not provided'}`,
    `User ID: ${ticket.userId || 'Guest user'}`,
    `Attachments: ${attachmentSummary}`,
    '',
    'Description:',
    ticket.description || 'No description provided'
  ].join('\n');

  const safeTicketId = escapeHtml(ticket.id || '');
  const safeCategory = escapeHtml(ticket.category || 'other');
  const safeName = escapeHtml(ticket.displayName || 'Not provided');
  const safeUsername = escapeHtml(ticket.username || 'Not provided');
  const safeEmail = escapeHtml(ticket.email || 'Not provided');
  const safeDevice = escapeHtml(ticket.device || 'Not provided');
  const safeDescription = escapeHtml(ticket.description || 'No description provided').replace(/\n/g, '<br />');
  const attachmentHtml = Array.isArray(ticket.attachments) && ticket.attachments.length > 0
    ? ticket.attachments.map((attachment) => {
        const safeNameValue = escapeHtml(attachment.name || 'Attachment');
        const safeUrl = escapeHtml(attachment.url || '');
        return attachment.url
          ? `<li style="margin: 0 0 6px;"><a href="${safeUrl}" style="color: ${EMAIL_THEME.link}; text-decoration: none;">${safeNameValue}</a></li>`
          : `<li style="margin: 0 0 6px;">${safeNameValue}</li>`;
      }).join('')
    : `<li style="margin: 0 0 6px;">${escapeHtml((ticket.attachmentNames || []).join(', ') || 'None')}</li>`;

  const html = buildEmailShell({
    eyebrow: 'SnakrX Support Console',
    title: 'Support inbox delivery',
    subtitle: 'A new player ticket has arrived in the SnakrX support pipeline and is ready for review.',
    bodyHtml: `
      ${buildCard(`
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          ${buildInfoRow('Ticket ID', safeTicketId)}
          ${buildInfoRow('Category', safeCategory)}
          ${buildInfoRow('Name', safeName)}
          ${buildInfoRow('Username', safeUsername)}
          ${buildInfoRow('Email', safeEmail)}
          ${buildInfoRow('Device', safeDevice)}
        </table>
      `)}
      ${buildCard(`
        <div style="margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${EMAIL_THEME.textSubtle};">
          Attachments
        </div>
        <ul style="margin: 0; padding: 0 0 0 18px; color: ${EMAIL_THEME.textMuted};">
          ${attachmentHtml}
        </ul>
      `)}
      ${buildCard(`
        <div style="margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${EMAIL_THEME.textSubtle};">
          Ticket summary
        </div>
        <div style="font-size: 14px; line-height: 1.75; color: ${EMAIL_THEME.textPrimary};">
          ${safeDescription}
        </div>
      `, 'margin-bottom: 0;')}
    `
  });

  return { subject, text, html };
};

const buildSupportUpdateEmail = (ticket, nextStatus, adminResponse) => {
  const subject = `[SnakrX Support Update] ${ticket.title}`;
  const safeResponse = sanitizeText(adminResponse, 2000) || 'We updated your ticket status and will continue handling the request.';
  const text = [
    `Ticket ID: ${ticket.id}`,
    `Category: ${ticket.category}`,
    `Status: ${nextStatus}`,
    '',
    'Update from SnakrX support:',
    safeResponse,
    '',
    'You can review this ticket from the Support Center when signed in.'
  ].join('\n');

  const safeTicketId = escapeHtml(ticket.id || '');
  const safeCategory = escapeHtml(ticket.category || 'other');
  const safeStatus = escapeHtml(nextStatus || 'open');
  const safeResponseHtml = escapeHtml(safeResponse).replace(/\n/g, '<br />');

  const html = buildEmailShell({
    eyebrow: 'SnakrX Support Console',
    title: 'Ticket response',
    subtitle: 'Your support request has been updated by the SnakrX team.',
    bodyHtml: `
      ${buildCard(`
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          ${buildInfoRow('Ticket ID', safeTicketId)}
          ${buildInfoRow('Category', safeCategory)}
          ${buildInfoRow('Status', `<span style="color: ${EMAIL_THEME.success}; font-weight: 700;">${safeStatus}</span>`)}
        </table>
      `)}
      ${buildCard(`
        <div style="margin: 0 0 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${EMAIL_THEME.textSubtle};">
          Latest update
        </div>
        <div style="font-size: 14px; line-height: 1.75; color: ${EMAIL_THEME.textPrimary};">
          ${safeResponseHtml}
        </div>
      `)}
      <div style="font-size: 14px; line-height: 1.75; color: ${EMAIL_THEME.textMuted};">
        Sign in to the SnakrX Support Center to review the latest ticket details.
      </div>
    `
  });

  return { subject, text, html };
};

const buildPasswordResetEmail = ({ resetLink }) => {
  const safeResetLink = escapeHtml(resetLink || '');
  const subject = 'Reset your SnakrX password';
  const text = [
    'We received a request to reset your SnakrX password.',
    '',
    'Open the link below to choose a new password:',
    resetLink,
    '',
    'If you did not request this, you can ignore this email.'
  ].join('\n');

  const html = buildEmailShell({
    eyebrow: 'SnakrX Account Recovery',
    title: 'Reset your SnakrX password',
    subtitle: 'Open the secure link below to choose a new password inside the SnakrX website.',
    bodyHtml: `
      ${buildCard(`
        <div style="margin: 0 0 14px; font-size: 14px; line-height: 1.75; color: ${EMAIL_THEME.textMuted};">
          This reset link leads directly to the SnakrX password recovery page on your web app.
        </div>
        <a href="${safeResetLink}" style="display: inline-block; padding: 14px 22px; border-radius: 14px; background: linear-gradient(135deg, ${EMAIL_THEME.accent}, ${EMAIL_THEME.accentStrong}); color: #fff7ed; font-size: 15px; font-weight: 800; text-decoration: none;">
          Reset password
        </a>
        <div style="margin: 16px 0 0; font-size: 12px; line-height: 1.8; color: ${EMAIL_THEME.textSubtle}; word-break: break-all;">
          ${safeResetLink}
        </div>
      `)}
      <div style="font-size: 13px; line-height: 1.75; color: ${EMAIL_THEME.textSubtle};">
        If you did not request a password reset, you can ignore this email and your current password will remain active.
      </div>
    `
  });

  return { subject, text, html };
};

module.exports = {
  getTransporter,
  getOtpSalt,
  buildOtpEmail,
  buildSupportEmail,
  buildSupportUpdateEmail,
  buildPasswordResetEmail
};
