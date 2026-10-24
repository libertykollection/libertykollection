import { getTransporter, getMailUser } from './smtp';
import { wrapEmailBody } from './emailTemplate';
import prisma from './prisma';

// Function to send email notification when order status is updated
export async function sendStatusUpdateEmail({ email, name, orderId, status }) {
  try {
    const transporter = getTransporter();
    if (!transporter) return;

    const mailUser = getMailUser();
    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://gloriacosmetics.pk';

    let brandName = 'Official Store';
    try {
      const details = await prisma.companyDetails.findFirst();
      if (details?.name) brandName = details.name;
    } catch (e) {}

    // Color code status
    let statusColor = '#333';
    if (status.toLowerCase() === 'shipped') statusColor = '#2196F3';
    if (status.toLowerCase() === 'delivered') statusColor = '#4CAF50';
    if (status.toLowerCase() === 'cancelled') statusColor = '#F44336';
    if (status.toLowerCase() === 'processing') statusColor = '#FF9800';

    const emailContent = `
      <p>Hello <strong>${name}</strong>,</p>
      <p>We wanted to let you know that your order <strong>#${orderId}</strong> status has been updated.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 14px; color: #666; display: block; margin-bottom: 5px;">New Status</span>
        <span style="font-size: 24px; font-weight: bold; color: ${statusColor}; text-transform: uppercase;">${status}</span>
      </div>

      <p>You can check the latest details in your account dashboard.</p>
      <div style="text-align: center;">
        <a href="${baseUrl}/customer/pages/orders" class="button">View Order Details</a>
      </div>
    `;

    const htmlBody = wrapEmailBody(`Order Update: #${orderId}`, emailContent, brandName);

    const mailOptions = {
      from: `"${brandName} Orders" <${mailUser}>`,
      to: email,
      subject: `Order #${orderId} - Status Update`,
      html: htmlBody,
    };

    console.log(`[SMTP] Attempting to send status update email to: ${email} for Order #${orderId}`);
    await transporter.sendMail(mailOptions);
    console.log('[SMTP] Status update email sent successfully to', email);
  } catch (error) {
    console.error('[SMTP] Error sending status update email:', error);
  }
}
