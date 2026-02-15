import { sendUploadNotification, sendCompletionNotification } from './notifications';
import { getTransporter, generateCompletionEmailTemplate, generateUploadEmailTemplate } from './email';

jest.mock('./email');

describe('Notification Utility', () => {
  let mockTransporter;

  beforeEach(() => {
    jest.resetAllMocks();
    mockTransporter = { sendMail: jest.fn().mockResolvedValue(true) };
    getTransporter.mockReturnValue(mockTransporter);
    generateCompletionEmailTemplate.mockReturnValue('<html>Completion Content</html>');
    generateUploadEmailTemplate.mockReturnValue('<html>Upload Content</html>');
    process.env.MANAGER_EMAIL = 'manager@example.com';
    process.env.SMTP_USER = 'sender@example.com';
  });

  describe('sendUploadNotification', () => {
    it('should send an email for a photo upload', async () => {
      await sendUploadNotification('Zone 1', 'before', 'work123');

      expect(getTransporter).toHaveBeenCalled();
      expect(generateUploadEmailTemplate).toHaveBeenCalledWith(expect.objectContaining({
        zoneName: 'Zone 1',
        photoType: 'before',
        workId: 'work123'
      }));
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'manager@example.com',
        html: '<html>Upload Content</html>'
      }));
    });
  });

  describe('sendCompletionNotification', () => {
    it('should send an email if the documentation cycle is finished', async () => {
      const workRecord = {
        _id: 'work123',
        beforePhotos: [{ timestamp: new Date('2026-02-15T10:00:00Z'), url: '/uploads/before.jpg' }],
        afterPhotos: [{ timestamp: new Date('2026-02-15T11:00:00Z'), url: '/uploads/after.jpg' }]
      };
      const zoneName = 'Zone 1';

      await sendCompletionNotification(zoneName, workRecord);

      expect(getTransporter).toHaveBeenCalled();
      expect(generateCompletionEmailTemplate).toHaveBeenCalledWith(expect.objectContaining({
        zoneName: 'Zone 1',
        timeDifference: expect.any(String),
      }));
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'manager@example.com',
        html: '<html>Completion Content</html>'
      }));
    });
  });
});
