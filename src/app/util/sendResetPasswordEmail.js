import { getTransporter, getMailUser } from './smtp';
import { wrapEmailBody } from './emailTemplate';
import prisma from './prisma';

export async function sendResetPasswordEmail(email, token) {
  try {
    const transporter = getTransporter();
    if (!transporter) throw new Error('SMTP Configuration Error');

    const mailUser = getMailUser();
    const baseUrl = process.env.BASE_URL || 'https://gloriacosmetics.pk';
    const resetUrl = `${baseUrl}/customer/pages/reset?token=${token}`;

    let brandName = 'Official Store';
    try {
      const details = await prisma.companyDetails.findFirst();
      if (details?.name) brandName = details.name;
    } catch (e) {}

    const emailContent = `
      <p>You requested a password reset for your ${brandName} account.</p>
      <p>Please click the button below to set a new password. This link is valid for 1 hour.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <p style="margin-top: 30px; font-size: 13px; color: #666;">
        If you didn't request this, you can safely ignore this email.<br/>
        Button key working? Copy and paste this link:<br/>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
    `;

    const htmlBody = wrapEmailBody('Password Reset Request', emailContent, brandName);

    const mailOptions = {
      from: `"${brandName} Security" <${mailUser}>`,
      to: email,
      subject: `Reset Your Password - ${brandName}`,
      text: `You requested a password reset. Please reset your password by clicking the following link: ${resetUrl}`,
      html: htmlBody,
    };

    const ok = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to ', email);
    return ok;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
