import { sendUploadNotification, sendCompletionNotification, sendDecisionNotification } from './notifications';
import { getTransporter, generateCompletionEmailTemplate, generateUploadEmailTemplate, generateDecisionEmailTemplate } from './email';

jest.mock('./email');

describe('Notification Utility', () => {
  let mockTransporter;

  beforeEach(() => {
    jest.resetAllMocks();
    mockTransporter = { sendMail: jest.fn().mockResolvedValue(true) };
    getTransporter.mockReturnValue(mockTransporter);
    generateCompletionEmailTemplate.mockReturnValue('<html>Completion Content</html>');
    generateUploadEmailTemplate.mockReturnValue('<html>Upload Content</html>');
    generateDecisionEmailTemplate.mockReturnValue('<html>Decision Content</html>');
    
    process.env.MANAGER_EMAIL = 'fallback@example.com';
    process.env.SMTP_USER = 'sender@example.com';
    process.env.CEO_EMAIL = 'ceo@example.com';
  });

  describe('sendUploadNotification', () => {
    it('should send an email to the provided recipient', async () => {
      await sendUploadNotification('Zone 1', 'before', 'work123', 'test@example.com');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        html: '<html>Upload Content</html>'
      }));
    });
  });

  describe('sendDecisionNotification', () => {
    it('should send a decision email to the provided recipient', async () => {
      await sendDecisionNotification('Zone 1', 'work123', 'complete', 'Good work', 'test@example.com');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        html: '<html>Decision Content</html>'
      }));
    });
  });

  describe('sendCompletionNotification', () => {
    it('should send an email to the provided recipient if finished', async () => {
      const workRecord = {
        _id: 'work123',
        beforePhotos: [{ timestamp: new Date(), url: '/uploads/before.jpg' }],
        afterPhotos: [{ timestamp: new Date(), url: '/uploads/after.jpg' }]
      };
      
      await sendCompletionNotification('Zone 1', workRecord, 'test@example.com');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        html: '<html>Completion Content</html>'
      }));
    });
  });
});
