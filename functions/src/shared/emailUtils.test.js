// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('emailUtils', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.EMAIL_USER = 'mailer@example.com';
    process.env.EMAIL_PASS = ' app-password ';
  });

  it('reuses a single transporter instance across calls', async () => {
    const module = await import('./emailUtils.js');

    const firstTransporter = module.getTransporter();
    const secondTransporter = module.getTransporter();

    expect(firstTransporter).toBe(secondTransporter);
    expect(firstTransporter.options).toMatchObject({
      service: 'gmail',
      pool: true,
      maxConnections: 1,
      socketTimeout: 20000,
      auth: {
        user: 'mailer@example.com',
        pass: 'app-password'
      }
    });
  });

  it('renders OTP emails with shared SnakrX branding', async () => {
    const module = await import('./emailUtils.js');

    const email = module.buildOtpEmail({ code: '482193', expiresMinutes: 7 });

    expect(email.subject).toBe('SnakrX verification code');
    expect(email.text).toContain('482193');
    expect(email.html).toContain('SnakrX Arena Access');
    expect(email.html).toContain('482193');
    expect(email.html).toContain('Enter this code in the SnakrX sign-up flow');
  });

  it('renders support emails with the shared SnakrX shell', async () => {
    const module = await import('./emailUtils.js');

    const email = module.buildSupportEmail({
      id: 'ticket-42',
      title: 'Inventory desync',
      category: 'bug',
      clientCreatedAt: Date.UTC(2026, 2, 20),
      displayName: 'Bala',
      username: 'bala',
      email: 'bala@example.com',
      device: 'Chrome',
      attachments: [{ name: 'capture.png', url: 'https://example.com/capture.png' }],
      description: 'The rewards panel does not update until reload.'
    });

    expect(email.subject).toBe('[SnakrX Support] Inventory desync');
    expect(email.html).toContain('SnakrX Support Console');
    expect(email.html).toContain('Support inbox delivery');
    expect(email.html).toContain('capture.png');
  });

  it('renders support update emails with the shared SnakrX shell', async () => {
    const module = await import('./emailUtils.js');

    const email = module.buildSupportUpdateEmail(
      {
        id: 'ticket-88',
        title: 'Game freeze on pause',
        category: 'bug'
      },
      'resolved',
      'We shipped a fix and you can retry now.'
    );

    expect(email.subject).toBe('[SnakrX Support Update] Game freeze on pause');
    expect(email.html).toContain('SnakrX Support Console');
    expect(email.html).toContain('Ticket response');
    expect(email.html).toContain('We shipped a fix and you can retry now.');
  });

  it('renders password reset emails with a SnakrX reset link CTA', async () => {
    const module = await import('./emailUtils.js');

    const email = module.buildPasswordResetEmail({
      resetLink: 'https://snakrx-23b0b.web.app/reset-password?mode=resetPassword&oobCode=test-code'
    });

    expect(email.subject).toBe('Reset your SnakrX password');
    expect(email.text).toContain('snakrx-23b0b.web.app/reset-password');
    expect(email.html).toContain('Reset your SnakrX password');
    expect(email.html).toContain('Reset password');
    expect(email.html).toContain('snakrx-23b0b.web.app/reset-password');
  });
});
