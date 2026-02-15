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
