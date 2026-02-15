import nodemailer from 'nodemailer';

export const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const generateCompletionEmailTemplate = (data) => {
  const {
    zoneName,
    beforeTimestamp,
    afterTimestamp,
    timeDifference,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .header { background-color: #f4f4f4; padding: 10px; text-align: center; border-bottom: 1px solid #ddd; }
        .content { padding: 20px; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #777; text-align: center; }
        .stat { margin-bottom: 10px; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Zone Documentation Complete</h2>
        </div>
        <div class="content">
          <p>The documentation cycle for <strong>${zoneName}</strong> has been completed.</p>
          
          <div class="stat"><span class="label">Zone:</span> ${zoneName}</div>
          <div class="stat"><span class="label">Before Capture:</span> ${beforeTimestamp}</div>
          <div class="stat"><span class="label">After Capture:</span> ${afterTimestamp}</div>
          <div class="stat"><span class="label">Duration:</span> ${timeDifference}</div>
        </div>
        <div class="footer">
          <p>This is an automated notification from Zone Photo Tracker.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateUploadEmailTemplate = (data) => {
  const {
    zoneName,
    photoType, // 'before' or 'after'
    timestamp,
    workId,
  } = data;

  const title = photoType === 'before' ? 'Initial Documentation (Before)' : 'Final Documentation (After)';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 20px auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .header { background-color: #f4f4f4; padding: 10px; text-align: center; border-bottom: 1px solid #ddd; }
        .content { padding: 20px; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #777; text-align: center; }
        .stat { margin-bottom: 10px; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${title} Uploaded</h2>
        </div>
        <div class="content">
          <p>A <strong>${photoType}</strong> photo has been uploaded for <strong>${zoneName}</strong>.</p>
          
          <div class="stat"><span class="label">Zone:</span> ${zoneName}</div>
          <div class="stat"><span class="label">Work ID:</span> ${workId.slice(-8).toUpperCase()}</div>
          <div class="stat"><span class="label">Timestamp:</span> ${timestamp}</div>
        </div>
        <div class="footer">
          <p>This is an automated notification from Zone Photo Tracker.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
