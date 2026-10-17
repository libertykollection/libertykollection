import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma';

export async function POST(request) {
  try {
    // Parse the request body to get date1 and date2
    const { date1, date2 } = await request.json();

    // Convert date strings to Date objects, preserving the time part if present
    const startDate = new Date(date1);
    const endDate = new Date(date2);

    // Log for debugging
    console.log("Start date is:", startDate, "End date is:", endDate);

    // Validate the dates
    if (isNaN(startDate) || isNaN(endDate)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Ensure endDate is after startDate, add end of day to endDate
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Ensure the endDate includes the full day (23:59:59) to include orders from the whole day
    endDate.setHours(23, 59, 59, 999);

    // List of statuses to aggregate
    const statuses = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

    // Initialize an object to hold the results
    const results = {};

    // Loop through each status and perform the aggregation
    for (const status of statuses) {
      const aggregation = await prisma.order.aggregate({
        _count: {
          id: true,
        },
        _sum: {
          netTotal: true,
        },
        where: {
          status: status,
          updatedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Store the results with the status as the key
      results[status.toLowerCase()] = {
        count: aggregation._count.id || 0,
        amount: aggregation._sum.netTotal || 0,
      };
    }

    // Return the aggregated data as a JSON response
    return NextResponse.json({
      status: 200,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
