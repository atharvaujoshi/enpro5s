import { sendCompletionEmailIfFinished } from './notifications';
import { getTransporter, generateCompletionEmailTemplate } from './email';

jest.mock('./email');

describe('Notification Utility', () => {
  let mockTransporter;

  beforeEach(() => {
    jest.resetAllMocks();
    mockTransporter = { sendMail: jest.fn().mockResolvedValue(true) };
    getTransporter.mockReturnValue(mockTransporter);
    generateCompletionEmailTemplate.mockReturnValue('<html>Email Content</html>');
    process.env.MANAGER_EMAIL = 'manager@example.com';
    process.env.SMTP_USER = 'sender@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('should send an email if the documentation cycle is finished (before + after photos)', async () => {
    const workRecord = {
      _id: 'work123',
      beforePhotos: [{ timestamp: new Date('2026-02-15T10:00:00Z'), url: '/uploads/before.jpg' }],
      afterPhotos: [{ timestamp: new Date('2026-02-15T11:00:00Z'), url: '/uploads/after.jpg' }]
    };
    const zoneName = 'Zone 1';

    await sendCompletionEmailIfFinished(zoneName, workRecord);

    expect(getTransporter).toHaveBeenCalled();
    expect(generateCompletionEmailTemplate).toHaveBeenCalledWith(expect.objectContaining({
      zoneName: 'Zone 1',
      timeDifference: expect.any(String),
    }));
    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'manager@example.com',
      html: '<html>Email Content</html>'
    }));
  });

  it('should not send an email if the after photo is missing', async () => {
    const workRecord = {
      _id: 'work123',
      beforePhotos: [{ timestamp: new Date(), url: '/uploads/before.jpg' }],
      afterPhotos: []
    };
    const zoneName = 'Zone 1';

    await sendCompletionEmailIfFinished(zoneName, workRecord);

    expect(mockTransporter.sendMail).not.toHaveBeenCalled();
  });
});
