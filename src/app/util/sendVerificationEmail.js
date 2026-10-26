import { getTransporter, getMailUser } from './smtp';
import { wrapEmailBody } from './emailTemplate';
import prisma from './prisma';

export async function sendVerificationEmail(email, token) {
  const mailUser = getMailUser();
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://libertykollection.com';

  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('SMTP Configuration Error: Missing credentials');
  }

  try {
    // Verification step
    await transporter.verify();

    const verificationUrl = `${baseUrl}/customer/pages/verify?token=${token}`;

    const emailContent = `
      <p>Thank you for joining us! We're excited to have you on board.</p>
      <p>Please confirm your email address to activate your account and start shopping.</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      <p style="margin-top: 30px; font-size: 13px; color: #666;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </p>
    `;

    let brandName = 'Official Store';
    try {
      const details = await prisma.companyDetails.findFirst();
      if (details?.name) brandName = details.name;
    } catch (e) {}

    const htmlBody = wrapEmailBody(`Welcome to ${brandName}!`, emailContent, brandName);

    const mailOptions = {
      from: `"${brandName} Concierge" <${mailUser}>`,
      to: email,
      subject: `Welcome to ${brandName}! Verify Your Email`,
      text: `Welcome to ${brandName}! Please verify your email by clicking: ${verificationUrl}`,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Success! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[SMTP] FATAL ERROR:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    throw error;
  }
}
