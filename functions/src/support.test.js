// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';

class MockHttpsError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

let supportPrivate;

const createTimestampFactory = () => ({
  fromMillis: (value) => ({
    toMillis: () => value,
    value
  })
});

const createRateRef = (id) => ({
  id,
  path: `supportRateLimits/${id}`
});

const createSubmitSupportServices = ({
  ipCheck = { allowed: true },
  emailCheck = { allowed: true },
  saveErrorAtIndex = -1,
  sendMailError = null,
  nowValues = [1700000000000, 1700000000001]
} = {}) => {
  const ticketRef = {
    id: 'ticket-1',
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined)
  };
  const savedPaths = [];
  const deletedPaths = [];
  const saveCalls = [];
  const sendMail = sendMailError
    ? vi.fn().mockRejectedValue(sendMailError)
    : vi.fn().mockResolvedValue(undefined);
  const logger = {
    warn: vi.fn(),
    error: vi.fn()
  };
  const now = vi.fn(() => nowValues.shift() ?? 1700000009999);
  const checkRateLimit = vi.fn(async (ref) => (
    ref.id === 'ip-hash' ? ipCheck : emailCheck
  ));

  const bucket = {
    name: 'support-bucket',
    file: vi.fn((path) => ({
      save: vi.fn(async (buffer, options) => {
        const index = saveCalls.length;
        saveCalls.push({ path, buffer, options });
        if (index === saveErrorAtIndex) {
          throw new Error(`save-failed-${index}`);
        }
        savedPaths.push(path);
      }),
      delete: vi.fn(async () => {
        deletedPaths.push(path);
      })
    }))
  };

  return {
    services: {
      now,
      functions: {
        https: {
          HttpsError: MockHttpsError
        },
        logger
      },
      admin: {
        firestore: {
          Timestamp: createTimestampFactory()
        },
        storage: () => ({
          bucket: () => bucket
        })
      },
      crypto: {
        randomUUID: vi.fn(() => 'download-token')
      },
      db: {
        collection: (name) => ({
          doc: (id) => {
            if (name === 'supportRateLimits') return createRateRef(id);
            if (name === 'supportTickets') return id ? { id } : ticketRef;
            throw new Error(`Unexpected collection ${name}`);
          }
        })
      },
      getClientIp: () => '127.0.0.1',
      getIpHash: () => 'ip-hash',
      getEmailKey: () => 'player-example-com',
      checkRateLimit,
      buildSupportEmail: (ticket) => ({
        subject: `Ticket ${ticket.id}`,
        text: 'plain body',
        html: '<p>html body</p>'
      }),
      buildStorageDownloadUrl: (bucketName, path, token) =>
        `https://storage.example/${bucketName}/${path}?token=${token}`,
      getTransporter: () => ({ sendMail }),
      sanitizeText: (value = '', maxLength = 1000) =>
        typeof value === 'string' ? value.trim().slice(0, maxLength) : '',
      sanitizeFileName: (value = '', maxLength = 1000) =>
        typeof value === 'string'
          ? value.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, maxLength)
          : '',
      sanitizeSupportAttachments: supportPrivate.sanitizeSupportAttachments
    },
    mocks: {
      bucket,
      checkRateLimit,
      deletedPaths,
      logger,
      now,
      saveCalls,
      sendMail,
      ticketRef
    }
  };
};

const createUpdateSupportServices = ({
  ticketExists = true,
  sendMailError = null,
  ticketData = {
    email: 'player@example.com',
    customerUnreadUpdateCount: 2,
    status: 'open',
    priority: 'normal'
  }
} = {}) => {
  const sendMail = sendMailError
    ? vi.fn().mockRejectedValue(sendMailError)
    : vi.fn().mockResolvedValue(undefined);
  const logger = {
    warn: vi.fn(),
    error: vi.fn()
  };
  const ticketRef = { id: 'ticket-1' };
  const transactionSet = vi.fn();

  return {
    services: {
      now: () => 1700000000000,
      functions: {
        https: {
          HttpsError: MockHttpsError
        },
        logger
      },
      admin: {
        firestore: {
          Timestamp: createTimestampFactory()
        }
      },
      db: {
        collection: () => ({
          doc: () => ticketRef
        }),
        runTransaction: async (callback) => callback({
          get: vi.fn(async () => ({
            id: 'ticket-1',
            exists: ticketExists,
            data: () => ticketData
          })),
          set: transactionSet
        })
      },
      assertAdminUser: vi.fn().mockResolvedValue(undefined),
      getTransporter: () => ({ sendMail }),
      buildSupportUpdateEmail: (ticket, status, adminResponse) => ({
        subject: `${ticket.id}:${status}`,
        text: adminResponse,
        html: `<p>${adminResponse}</p>`
      }),
      sanitizeText: (value = '', maxLength = 1000) =>
        typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
    },
    mocks: {
      logger,
      sendMail,
      transactionSet
    }
  };
};

const createMarkSeenServices = ({ ticketDocs = {} } = {}) => {
  const updates = [];

  return {
    services: {
      now: () => 1700000000000,
      functions: {
        https: {
          HttpsError: MockHttpsError
        },
        logger: {
          warn: vi.fn(),
          error: vi.fn()
        }
      },
      admin: {
        firestore: {
          Timestamp: createTimestampFactory()
        }
      },
      db: {
        collection: () => ({
          doc: (id) => ({ id, path: `supportTickets/${id}` })
        }),
        runTransaction: async (callback) => callback({
          get: vi.fn(async (ref) => {
            const entry = ticketDocs[ref.id];
            return {
              id: ref.id,
              ref,
              exists: Boolean(entry),
              data: () => entry || {}
            };
          }),
          set: vi.fn((ref, payload) => {
            updates.push({ ref, payload });
          })
        })
      },
      sanitizeText: (value = '', maxLength = 1000) =>
        typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
    },
    mocks: {
      updates
    }
  };
};

beforeAll(async () => {
  const supportModule = await import('./support.js');
  supportPrivate = (supportModule.default ?? supportModule).__private__;
});

describe('support helpers', () => {
  it('normalizes valid support ticket input and defaults category/email sources safely', () => {
    const payload = supportPrivate.resolveSupportTicketInput({
      payload: {
        description: 'The leaderboard did not update after my game.',
        title: ' Score issue '
      },
      userPayload: {
        email: 'fallback@example.com'
      },
      authenticatedEmail: ' Player@Example.com '
    });

    expect(payload).toMatchObject({
      email: 'player@example.com',
      title: 'Score issue',
      category: 'other',
      description: 'The leaderboard did not update after my game.'
    });
  });

  it('rejects invalid support submissions', () => {
    expect(() => supportPrivate.resolveSupportTicketInput({
      payload: {
        email: 'bad-email',
        description: 'Long enough description',
        category: 'score_sync'
      }
    })).toThrow(/valid email/i);

    expect(() => supportPrivate.resolveSupportTicketInput({
      payload: {
        email: 'player@example.com',
        description: 'short',
        category: 'score_sync'
      }
    })).toThrow(/more detail/i);

    expect(() => supportPrivate.resolveSupportTicketInput({
      payload: {
        email: 'player@example.com',
        description: 'This description is long enough for validation.',
        category: 'not-real'
      }
    })).toThrow(/invalid support ticket category/i);
  });

  it('builds a support ticket record with defaults and attachment metadata', () => {
    const ticket = supportPrivate.buildSupportTicketRecord({
      ticketId: 'ticket-1',
      payload: {
        username: ' alpha ',
        source: '',
        device: ' Desktop Chrome '
      },
      userPayload: {
        displayName: ' Alpha Player '
      },
      context: {
        auth: {
          uid: 'user-1'
        }
      },
      resolvedInput: {
        category: 'other',
        description: 'The support form is not saving my screenshot.',
        email: 'player@example.com',
        title: 'Support request',
        supportAttachments: []
      },
      storedAttachments: [
        {
          name: 'error.png',
          contentType: 'image/png',
          size: 42,
          path: 'supportAttachments/ticket-1/error.png',
          url: 'https://example.com/error.png'
        }
      ],
      now: 1700000000000,
      timestampFactory: {
        fromMillis: (value) => ({ toMillis: () => value })
      }
    });

    expect(ticket).toMatchObject({
      id: 'ticket-1',
      userId: 'user-1',
      username: 'alpha',
      displayName: 'Alpha Player',
      email: 'player@example.com',
      category: 'other',
      title: 'Support request',
      description: 'The support form is not saving my screenshot.',
      device: 'Desktop Chrome',
      attachmentNames: ['error.png'],
      source: 'support_form'
    });
    expect(ticket.createdAt.toMillis()).toBe(1700000000000);
    expect(ticket.updatedAt.toMillis()).toBe(1700000000000);
  });

  it('builds admin ticket update payloads and seen-update resets', () => {
    const updatePayload = supportPrivate.buildAdminTicketUpdatePayload({
      currentTicket: {
        customerUnreadUpdateCount: 2
      },
      status: 'resolved',
      priority: 'high',
      adminResponse: 'Issue fixed.',
      now: 1700000000000,
      adminUserId: 'admin-1',
      timestampFactory: {
        fromMillis: (value) => ({ toMillis: () => value })
      }
    });

    expect(updatePayload).toMatchObject({
      status: 'resolved',
      priority: 'high',
      adminResponse: 'Issue fixed.',
      customerUnreadUpdate: true,
      customerUnreadUpdateCount: 3,
      adminUpdatedBy: 'admin-1'
    });
    expect(updatePayload.updatedAt.toMillis()).toBe(1700000000000);
    expect(updatePayload.adminUpdatedAt.toMillis()).toBe(1700000000000);

    const seenPayload = supportPrivate.buildSeenUpdatePayload({
      ticketData: {
        userId: 'user-1',
        customerUnreadUpdate: true
      },
      userId: 'user-1',
      now: {
        toMillis: () => 1700000001000
      }
    });
    expect(seenPayload).toEqual({
      customerUnreadUpdate: false,
      customerUnreadUpdateCount: 0,
      customerSeenAt: { toMillis: expect.any(Function) },
      updatedAt: { toMillis: expect.any(Function) }
    });

    expect(supportPrivate.buildSeenUpdatePayload({
      ticketData: {
        userId: 'user-2',
        customerUnreadUpdate: true
      },
      userId: 'user-1',
      now: {
        toMillis: () => 1700000001000
      }
    })).toBeNull();
  });

  it('sanitizes valid support attachments and rejects invalid batches', () => {
    expect(supportPrivate.sanitizeSupportAttachments([
      {
        name: ' screenshot.png ',
        contentType: ' IMAGE/PNG ',
        dataBase64: `data:image/png;base64,${Buffer.from('hello world').toString('base64')}`,
        size: 11
      },
      {
        name: '   ',
        contentType: 'text/plain',
        dataBase64: Buffer.from('notes').toString('base64')
      }
    ])).toEqual([
      {
        name: 'screenshot.png',
        contentType: 'image/png',
        size: 11,
        buffer: Buffer.from('hello world')
      },
      {
        name: 'attachment-2',
        contentType: 'text/plain',
        size: 5,
        buffer: Buffer.from('notes')
      }
    ]);

    expect(() => supportPrivate.sanitizeSupportAttachments('nope')).toThrow(/Invalid support attachment payload/i);
    expect(() => supportPrivate.sanitizeSupportAttachments([
      { contentType: 'application/zip', dataBase64: Buffer.from('x').toString('base64') }
    ])).toThrow(/unsupported file type/i);
    expect(() => supportPrivate.sanitizeSupportAttachments([
      { name: 'report.pdf', contentType: 'application/pdf', dataBase64: '' }
    ])).toThrow(/missing file data/i);
    expect(() => supportPrivate.sanitizeSupportAttachments([
      { name: 'bad.txt', contentType: 'text/plain', dataBase64: '%%%not-base64%%%' }
    ])).toThrow(/invalid file data/i);

    const oversized = Buffer.alloc((2 * 1024 * 1024) + 1, 1).toString('base64');
    expect(() => supportPrivate.sanitizeSupportAttachments([
      { name: 'huge.pdf', contentType: 'application/pdf', dataBase64: oversized }
    ])).toThrow(/exceeds the 2 MB limit/i);

    const twoMb = Buffer.alloc(2 * 1024 * 1024, 1).toString('base64');
    expect(() => supportPrivate.sanitizeSupportAttachments([
      { name: 'one.bin', contentType: 'application/pdf', dataBase64: twoMb },
      { name: 'two.bin', contentType: 'application/pdf', dataBase64: twoMb },
      { name: 'three.bin', contentType: 'application/pdf', dataBase64: twoMb },
      { name: 'four.bin', contentType: 'application/pdf', dataBase64: Buffer.from('x').toString('base64') }
    ])).toThrow(/up to 3 support attachments/i);
  });
});

describe('support handlers', () => {
  it('submits a support ticket, uploads attachments, and sends notification email', async () => {
    const previousSupportEmailTo = process.env.SUPPORT_EMAIL_TO;
    const previousEmailUser = process.env.EMAIL_USER;
    process.env.SUPPORT_EMAIL_TO = 'support@example.com';
    process.env.EMAIL_USER = 'noreply@example.com';

    const { services, mocks } = createSubmitSupportServices();

    try {
      await expect(supportPrivate.submitSupportTicketHandler(
        {
          payload: {
            description: 'The support form did not save my screenshot after the game.',
            attachments: [
              {
                name: ' screenshot.png ',
                contentType: 'image/png',
                dataBase64: Buffer.from('proof').toString('base64')
              }
            ]
          },
          user: {
            displayName: 'Player One'
          }
        },
        {
          auth: {
            uid: 'user-1',
            token: {
              email: ' Player@Example.com '
            }
          }
        },
        services
      )).resolves.toEqual({
        ticketId: 'ticket-1',
        attachmentCount: 1
      });
    } finally {
      process.env.SUPPORT_EMAIL_TO = previousSupportEmailTo;
      process.env.EMAIL_USER = previousEmailUser;
    }

    expect(mocks.checkRateLimit).toHaveBeenCalledTimes(2);
    expect(mocks.ticketRef.set).toHaveBeenCalledWith(expect.objectContaining({
      email: 'player@example.com',
      category: 'other',
      attachmentNames: ['screenshot.png']
    }), { merge: true });
    expect(mocks.saveCalls).toHaveLength(1);
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'support@example.com',
      replyTo: 'player@example.com'
    }));
  });

  it('rejects throttled support submissions before creating a ticket', async () => {
    const { services, mocks } = createSubmitSupportServices({
      emailCheck: {
        allowed: false,
        retryAfterMs: 5432
      }
    });

    await expect(supportPrivate.submitSupportTicketHandler(
      {
        payload: {
          email: 'player@example.com',
          category: 'score_sync',
          description: 'The support form did not save my screenshot after the game.'
        }
      },
      { auth: {} },
      services
    )).rejects.toMatchObject({
      code: 'resource-exhausted',
      details: {
        retryAfterMs: 5432
      }
    });

    expect(mocks.ticketRef.set).not.toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it('cleans up uploaded attachments and ticket records when submission fails mid-upload', async () => {
    const { services, mocks } = createSubmitSupportServices({
      saveErrorAtIndex: 1,
      nowValues: [1700000000000, 1700000000001, 1700000000002]
    });

    await expect(supportPrivate.submitSupportTicketHandler(
      {
        payload: {
          email: 'player@example.com',
          category: 'score_sync',
          description: 'The support form did not save my screenshot after the game.',
          attachments: [
            {
              name: 'one.png',
              contentType: 'image/png',
              dataBase64: Buffer.from('first').toString('base64')
            },
            {
              name: 'two.png',
              contentType: 'image/png',
              dataBase64: Buffer.from('second').toString('base64')
            }
          ]
        }
      },
      { auth: {} },
      services
    )).rejects.toMatchObject({
      code: 'internal',
      message: 'Could not create the support ticket right now. Please try again.'
    });

    expect(mocks.deletedPaths).toEqual([
      'supportAttachments/ticket-1/1700000000001_0_one.png'
    ]);
    expect(mocks.ticketRef.delete).toHaveBeenCalledTimes(1);
    expect(mocks.logger.error).toHaveBeenCalledWith(
      'Support ticket submission failed',
      expect.objectContaining({
        ticketId: 'ticket-1',
        message: 'save-failed-1'
      })
    );
  });

  it('updates support tickets through the admin handler and tolerates email send failures', async () => {
    const { services, mocks } = createUpdateSupportServices({
      sendMailError: new Error('smtp unavailable')
    });

    await expect(supportPrivate.updateSupportTicketHandler(
      {
        ticketId: 'ticket-1',
        status: 'resolved',
        priority: 'high',
        adminResponse: 'Issue fixed'
      },
      {
        auth: {
          uid: 'admin-1'
        }
      },
      services
    )).resolves.toMatchObject({
      ticket: expect.objectContaining({
        id: 'ticket-1',
        status: 'resolved',
        priority: 'high',
        adminResponse: 'Issue fixed',
        adminUpdatedBy: 'admin-1',
        customerUnreadUpdateCount: 3
      })
    });

    expect(mocks.transactionSet).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        status: 'resolved',
        priority: 'high'
      }),
      { merge: true }
    );
    expect(mocks.logger.warn).toHaveBeenCalledWith(
      'Support update email failed',
      expect.objectContaining({
        ticketId: 'ticket-1',
        message: 'smtp unavailable'
      })
    );
  });

  it('marks only unread tickets owned by the caller as seen', async () => {
    const { services, mocks } = createMarkSeenServices({
      ticketDocs: {
        'ticket-1': {
          userId: 'user-1',
          customerUnreadUpdate: true
        },
        'ticket-2': {
          userId: 'user-2',
          customerUnreadUpdate: true
        },
        'ticket-3': {
          userId: 'user-1',
          customerUnreadUpdate: false
        }
      }
    });

    await expect(supportPrivate.markSupportTicketUpdatesSeenHandler(
      {
        ticketIds: ['ticket-1', 'ticket-2', 'ticket-3', '', null]
      },
      {
        auth: {
          uid: 'user-1'
        }
      },
      services
    )).resolves.toEqual({
      updatedCount: 1
    });

    expect(mocks.updates).toHaveLength(1);
    expect(mocks.updates[0]).toMatchObject({
      ref: {
        id: 'ticket-1'
      },
      payload: {
        customerUnreadUpdate: false,
        customerUnreadUpdateCount: 0
      }
    });
  });
});
