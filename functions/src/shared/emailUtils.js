const { functions, nodemailer } = require('../runtime');
const { OTP_TTL_MS } = require('./constants');
const { escapeHtml, getRequiredEnv, sanitizeText } = require('./coreUtils');

const getTransporter = () => {
  const user = getRequiredEnv('EMAIL_USER');
  const pass = getRequiredEnv('EMAIL_PASS').replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
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

const buildOtpEmail = ({ code, expiresMinutes = Math.floor(OTP_TTL_MS / 60000) }) => {
  const subject = 'SnakrX verification code';
  const text = `Your SnakrX verification code is ${code}. It expires in ${expiresMinutes} minutes.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <div style="max-width: 520px; margin: 0 auto; padding: 24px; border-radius: 12px; background: #0f172a; color: #f8fafc;">
        <h2 style="margin: 0 0 12px; color: #f8fafc;">SnakrX Email Verification</h2>
        <p style="margin: 0 0 16px; color: #cbd5f5;">
          Use the code below to verify your email address and finish creating your account.
        </p>
        <div style="padding: 16px; background: #1e293b; border-radius: 10px; text-align: center; font-size: 28px; letter-spacing: 4px; font-weight: 700;">
          ${code}
        </div>
        <p style="margin: 16px 0 0; color: #cbd5f5;">
          This code expires in ${expiresMinutes} minutes. If you did not request this, you can ignore this email.
        </p>
      </div>
    </div>
  `;

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
  const safeCategory = escapeHtml(ticket.category || 'general');
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
          ? `<li style="margin: 0 0 6px;"><a href="${safeUrl}" style="color: #93c5fd;">${safeNameValue}</a></li>`
          : `<li style="margin: 0 0 6px;">${safeNameValue}</li>`;
      }).join('')
    : `<li style="margin: 0 0 6px;">${escapeHtml((ticket.attachmentNames || []).join(', ') || 'None')}</li>`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <div style="max-width: 680px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
        <h2 style="margin: 0 0 12px;">New SnakrX Support Ticket</h2>
        <p style="margin: 0 0 12px; color: #cbd5e1;"><strong>Ticket ID:</strong> ${safeTicketId}</p>
        <p style="margin: 0 0 6px; color: #cbd5e1;"><strong>Category:</strong> ${safeCategory}</p>
        <p style="margin: 0 0 6px; color: #cbd5e1;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin: 0 0 6px; color: #cbd5e1;"><strong>Username:</strong> ${safeUsername}</p>
        <p style="margin: 0 0 6px; color: #cbd5e1;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 6px; color: #cbd5e1;"><strong>Device:</strong> ${safeDevice}</p>
        <div style="margin: 0 0 12px; color: #cbd5e1;">
          <strong>Attachments:</strong>
          <ul style="margin: 8px 0 0 18px; padding: 0;">
            ${attachmentHtml}
          </ul>
        </div>
        <div style="padding: 12px; border-radius: 8px; background: #1e293b; color: #f1f5f9;">
          ${safeDescription}
        </div>
      </div>
    </div>
  `;

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
  const safeCategory = escapeHtml(ticket.category || 'general');
  const safeStatus = escapeHtml(nextStatus || 'open');
  const safeResponseHtml = escapeHtml(safeResponse).replace(/\n/g, '<br />');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <div style="max-width: 640px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
        <h2 style="margin: 0 0 12px;">SnakrX Support Update</h2>
        <p style="margin: 0 0 6px; color: #cbd5e1;"><strong>Ticket ID:</strong> ${safeTicketId}</p>
        <p style="margin: 0 0 6px; color: #cbd5e1;"><strong>Category:</strong> ${safeCategory}</p>
        <p style="margin: 0 0 12px; color: #cbd5e1;"><strong>Status:</strong> ${safeStatus}</p>
        <div style="padding: 14px; border-radius: 10px; background: #1e293b; color: #f1f5f9;">
          ${safeResponseHtml}
        </div>
        <p style="margin: 16px 0 0; color: #cbd5e1;">
          Sign in to the SnakrX Support Center to review the latest ticket details.
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
};

module.exports = {
  getTransporter,
  getOtpSalt,
  buildOtpEmail,
  buildSupportEmail,
  buildSupportUpdateEmail
};
