import moment from 'moment';
import { getTransporter, generateCompletionEmailTemplate } from './email';

export const sendCompletionEmailIfFinished = async (zoneName, workRecord) => {
  const { beforePhotos, afterPhotos } = workRecord;

  // Only send email if we have at least one before and one after photo
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
      to: process.env.MANAGER_EMAIL,
      subject: `[Zone Photo Tracker] ${zoneName} Documentation Complete`,
      html,
    });
    console.log(`Completion email sent for ${zoneName}`);
  } catch (error) {
    console.error(`Failed to send completion email for ${zoneName}:`, error);
  }
};
