import { getTransporter, getMailUser } from './smtp';
import { wrapEmailBody } from './emailTemplate';
import prisma from './prisma';

export async function sendOrderConfirmation(email, orderId, order) {
  const mailUser = getMailUser();

  // Safety check to prevent destructuring from null/undefined
  if (!order) {
    console.error('[SMTP] Order object is missing.');
    return null;
  }

  const {
    netTotal = 0,
    total: subtotal = 0,
    deliveryCharge = 0,
    extraDeliveryCharge = 0,
    orderItems: items = []
  } = order;

  const transporter = getTransporter();
  if (!transporter) {
    console.error('[SMTP] Missing credentials for order confirmation.');
    return null;
  }

  try {
    // Verification step
    await transporter.verify();

    // Create order items list for the email
    // Ensure items is an array before calling map
    const itemsList = (Array.isArray(items) ? items : [])
      .map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; color: #333;">
            <div style="font-weight: bold;">${item?.product?.name || 'Product'}</div>
            <div style="color: #666; font-size: 12px; margin-top: 4px;">
              ${item?.selectedSize ? `<span>Size: ${item.selectedSize}</span>` : ''}
              ${item?.selectedColor ? `<span style="margin-left: 10px;">Color: ${item.selectedColor}</span>` : ''}
            </div>
          </td>
          <td style="padding: 10px; text-align: center; color: #333;">x${item?.quantity || 1}</td>
          <td style="padding: 10px; text-align: right; color: #333;">Rs.${(item?.price || 0).toLocaleString()}</td>
        </tr>`
      )
      .join('');

    const emailContent = `
      <p style="text-align: center;">Transaction ID: <strong>#${orderId}</strong></p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; padding-bottom: 10px; border-bottom: 2px solid #eee;">Order Summary</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="text-align: left; font-size: 13px; color: #888;">
              <th style="padding: 10px; font-weight: normal;">Product</th>
              <th style="padding: 10px; font-weight: normal; text-align: center;">Qty</th>
              <th style="padding: 10px; font-weight: normal; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList || '<tr><td colspan="3" style="padding: 10px; text-align: center;">Order details not available</td></tr>'}
          </tbody>
          <tfoot style="color: #444;">
            <tr>
              <td colspan="2" style="padding: 10px 10px 5px 10px; text-align: right; font-size: 14px;">Order Amount</td>
              <td style="padding: 10px 10px 5px 10px; text-align: right; font-size: 14px;">Rs.${(subtotal || 0).toLocaleString()}</td>
            </tr>
            ${(order.discount || 0) > 0 ? `
            <tr>
              <td colspan="2" style="padding: 5px 10px; text-align: right; font-size: 14px;">Discount</td>
              <td style="padding: 5px 10px; text-align: right; font-size: 14px; color: #d9534f;">-Rs.${(order.discount || 0).toLocaleString()}</td>
            </tr>
            ` : ''}
            ${(order.tax || 0) > 0 ? `
            <tr>
              <td colspan="2" style="padding: 5px 10px; text-align: right; font-size: 14px;">Tax</td>
              <td style="padding: 5px 10px; text-align: right; font-size: 14px;">Rs.${(order.tax || 0).toLocaleString()}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="2" style="padding: 5px 10px; text-align: right; font-size: 14px;">Shipping</td>
              <td style="padding: 5px 10px; text-align: right; font-size: 14px;">Rs.${(deliveryCharge || 0).toLocaleString()}</td>
            </tr>
            ${(extraDeliveryCharge || 0) > 0 ? `
            <tr>
              <td colspan="2" style="padding: 5px 10px; text-align: right; font-size: 14px;">COD Surcharge</td>
              <td style="padding: 5px 10px; text-align: right; font-size: 14px;">Rs.${(extraDeliveryCharge || 0).toLocaleString()}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="2" style="padding: 15px 10px; font-weight: bold; font-size: 18px; color: #000;">Total</td>
              <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #008775;">Rs.${(netTotal || 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p style="text-align: center; color: #666; font-size: 13px;">
        We've received your order and will notify you once it ships. You can view your order details in your dashboard.
      </p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://gloriacosmetics.pk'}/customer/pages/orders" class="button">View My Orders</a>
      </div>
    `;

    let brandName = 'Official Store';
    try {
      const details = await prisma.companyDetails.findFirst();
      if (details?.name) brandName = details.name;
    } catch (e) {}

    const htmlBody = wrapEmailBody('Thank You for Your Order!', emailContent, brandName);

    const mailOptions = {
      from: `"${brandName} Orders" <${mailUser}>`,
      to: email,
      subject: `Order Confirmation - Order ID #${orderId}`,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP] Order Confirmation Sent! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('[SMTP] FATAL ERROR sending order confirmation:', {
      message: error.message,
      code: error.code
    });
    // Don't throw error to prevent blocking order creation
    return null;
  }
}
