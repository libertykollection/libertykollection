// server/api/shipping.js
import { NextResponse } from "next/server";
import prisma from "../../util/prisma";
import { sendStatusUpdateEmail } from "../../util/sendStatusUpdateEmail";

export async function POST(request) {
  try {
    const { email, orderId, shippingMethod, shippingTerms, shipmentDate, deliveryDate } = await request.json();

    if (!email || !orderId) {
      return NextResponse.json({ message: "Email and Order ID are required", status: false }, { status: 400 });
    }

    // Ensure orderId is the correct type
    const parsedOrderId = isNaN(orderId) ? orderId : Number(orderId);

    const updatedOrder = await prisma.order.update({
      where: { id: parsedOrderId },
      data: {
        shippingMethod: shippingMethod || "",
        shippingTerms: shippingTerms || "",
        shipmentDate: shipmentDate ? new Date(shipmentDate) : null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      },
    });

    console.log("The Email is:", email);

    // Send email on status change
    if (updatedOrder) {
      // Robustness: Fallback for email/name
      let targetEmail = email || updatedOrder.email;
      let targetName = updatedOrder.recipientName || 'Customer';

      if (!targetEmail || targetEmail === 'N/A') {
        if (updatedOrder.userId) {
          const user = await prisma.user.findUnique({ where: { id: updatedOrder.userId } });
          if (user?.email) {
            targetEmail = user.email;
            targetName = user.name || targetName;
          }
        }
      }

      if (targetEmail && targetEmail !== 'N/A') {
        await sendStatusUpdateEmail({
          email: targetEmail,
          name: targetName,
          orderId: parsedOrderId,
          status: updatedOrder.status,
          shippingMethod,
          shippingTerms,
          shipmentDate: formatDate(shipmentDate),
          deliveryDate: formatDate(deliveryDate),
        });
      }
    }

    return NextResponse.json({ message: "Shipping information updated successfully", status: true, data: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error("Error updating shipping information:", error);
    return NextResponse.json({ message: "Failed to update shipping information", status: false }, { status: 500 });
  }
}

// Function to format date as "Month Day, Year"
function formatDate(dateString) {
  if (!dateString) return "TBA";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
