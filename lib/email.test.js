import { getTransporter } from './email';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('Email Transporter', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should create a transporter with correct configuration', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'password';

    const mockTransporter = { sendMail: jest.fn() };
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const transporter = getTransporter();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false, // 587 is usually TLS
      auth: {
        user: 'user@example.com',
        pass: 'password',
      },
    });
    expect(transporter).toBe(mockTransporter);
  });

  it('should use secure: true for port 465', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'password';

    getTransporter();

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 465,
        secure: true,
      })
    );
  });
});

describe('Email Template Utility', () => {
  const { generateCompletionEmailTemplate } = require('./email');

  it('should generate a correctly formatted HTML template', () => {
    const data = {
      zoneName: 'Zone 1',
      beforeTimestamp: '2026-02-15 10:00:00',
      afterTimestamp: '2026-02-15 11:30:00',
      timeDifference: '1 hour 30 minutes',
      beforePhotoUrl: 'http://localhost:3000/uploads/before.jpg',
      afterPhotoUrl: 'http://localhost:3000/uploads/after.jpg',
    };

    const html = generateCompletionEmailTemplate(data);

    expect(html).toContain('Zone Documentation Complete');
    expect(html).toContain('Zone 1');
    expect(html).toContain('2026-02-15 10:00:00');
    expect(html).toContain('2026-02-15 11:30:00');
    expect(html).toContain('1 hour 30 minutes');
    expect(html).not.toContain('<img');
  });
});

describe('Email Decision Template', () => {
  const { generateDecisionEmailTemplate } = require('./email');

  it('should generate a decision email correctly', () => {
    const data = {
      zoneName: 'Zone 1',
      workId: 'work123',
      status: 'complete',
      comment: 'Excellent work!',
    };

    const html = generateDecisionEmailTemplate(data);

    expect(html).toContain('Inspection Decision: Approved');
    expect(html).toContain('Zone 1');
    expect(html).toContain('WORK123');
    expect(html).toContain('Excellent work!');
  });
});
