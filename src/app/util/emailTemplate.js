/**
 * Wraps the email content in a responsive, branded HTML template.
 * @param {string} title - The title/heading of the email.
 * @param {string} bodyContent - The main HTML content of the email.
 * @returns {string} - The complete HTML email string.
 */
export const wrapEmailBody = (title, bodyContent, brandName = 'Liberty Kollection') => {
  const currentYear = new Date().getFullYear();
  const brandColor = '#C53261';
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://libertykollection.com';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background-color: #120B10; padding: 25px 20px; text-align: center; }
        .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        .button { display: inline-block; padding: 14px 28px; background-color: #120B10; color: #ffffff !important; text-decoration: none; border-radius: 0px; font-weight: bold; margin-top: 20px; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; }
        h1 { color: #120B10; margin-top: 0; font-size: 24px; font-family: serif; }
        p { margin-bottom: 15px; }
        a { color: ${brandColor}; text-decoration: none; }
        @media only screen and (max-width: 600px) {
          .content { padding: 20px; }
          .container { width: 100% !important; border-radius: 0; }
        }
      </style>
    </head>
    <body>
      <div style="padding: 20px 0;">
        <div class="container">
          <!-- Header -->
          <div class="header">
             <span style="color: #ffffff; font-size: 22px; font-weight: bold; font-family: serif; letter-spacing: 0.1em; text-transform: uppercase;">${brandName}</span>
          </div>

          <!-- Main Content -->
          <div class="content">
            <h1>${title}</h1>
            ${bodyContent}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>&copy; ${currentYear} ${brandName}. All rights reserved.</p>
            <p>You are receiving this email because you signed up on our website.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
