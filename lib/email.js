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
    beforePhotoUrl,
    afterPhotoUrl,
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
        .photo-container { display: flex; justify-content: space-between; margin-top: 20px; }
        .photo-box { width: 48%; text-align: center; }
        .photo-box img { width: 100%; border-radius: 4px; border: 1px solid #ccc; }
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

          <div class="photo-container">
            <div class="photo-box">
              <p class="label">Before Photo</p>
              <img src="${beforePhotoUrl}" alt="Before Photo">
            </div>
            <div class="photo-box">
              <p class="label">After Photo</p>
              <img src="${afterPhotoUrl}" alt="After Photo">
            </div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from Zone Photo Tracker.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
