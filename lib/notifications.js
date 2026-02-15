import moment from 'moment';
import { getTransporter, generateCompletionEmailTemplate, generateUploadEmailTemplate, generateDecisionEmailTemplate } from './email';

export const getCEOEmail = () => process.env.CEO_EMAIL || 'ceo@company.com';

export const sendUploadNotification = async (zoneName, photoType, workId, recipientEmail) => {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  const html = generateUploadEmailTemplate({ zoneName, photoType, timestamp, workId });
  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `[Zone Photo Tracker] ${photoType.toUpperCase()} Photo Uploaded - ${zoneName}`,
      html,
    });
    console.log(`${photoType} upload notification sent to ${recipientEmail} for ${zoneName}`);
  } catch (error) {
    console.error(`Failed to send ${photoType} upload notification to ${recipientEmail}:`, error);
  }
};

export const sendCompletionNotification = async (zoneName, workRecord, recipientEmail) => {
  const { beforePhotos, afterPhotos } = workRecord;

  if (!beforePhotos?.length || !afterPhotos?.length) {
    return;
  }

  const beforePhoto = beforePhotos[beforePhotos.length - 1];
  const afterPhoto = afterPhotos[afterPhotos.length - 1];

  const beforeMoment = moment(beforePhoto.timestamp);
  const afterMoment = moment(afterPhoto.timestamp);
  const duration = moment.duration(afterMoment.diff(beforeMoment));
  
  const timeDifference = `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;

  const emailData = {
    zoneName,
    beforeTimestamp: beforeMoment.format('YYYY-MM-DD HH:mm:ss'),
    afterTimestamp: afterMoment.format('YYYY-MM-DD HH:mm:ss'),
    timeDifference,
  };

  const html = generateCompletionEmailTemplate(emailData);
  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `[Zone Photo Tracker] ${zoneName} Documentation Complete`,
      html,
    });
    console.log(`Completion email sent to ${recipientEmail} for ${zoneName}`);
  } catch (error) {
    console.error(`Failed to send completion email to ${recipientEmail} for ${zoneName}:`, error);
  }
};

export const sendDecisionNotification = async (zoneName, workId, status, comment, recipientEmail) => {
  const html = generateDecisionEmailTemplate({ zoneName, workId, status, comment });
  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `[Zone Photo Tracker] Work ${status.toUpperCase()} - ${zoneName}`,
      html,
    });
    console.log(`${status} decision notification sent to ${recipientEmail} for ${zoneName}`);
  } catch (error) {
    console.error(`Failed to send ${status} decision notification to ${recipientEmail}:`, error);
  }
};
