import { NextResponse } from 'next/server';
import prisma from '../../../util/prisma'; // Adjust the path based on your project structure

// Fetch social media links by ID
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const socialMedia = await prisma.socialMedia.findUnique({
      where: { id: parseInt(id) }, // Ensure ID is treated as a number
    });

    if (!socialMedia) {
      return NextResponse.json({ message: 'No social media links found for the given ID', status: false }, { status: 404 });
    }

    return NextResponse.json({ status: true, data: socialMedia });
  } catch (error) {
    console.error(`Error fetching social media links for ID ${id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch social media links', status: false, error: error.message }, { status: 500 });
  }
}

// Update social media links by ID
export async function PUT(request, { params }) {
    const { id } = params;
  
    try {
      const data = await request.json();
  
      // Validate incoming data
      if (!data || !data.facebook || !data.instagram || !data.twitter || !data.tiktok || !data.pinterest) {
        return NextResponse.json(
          { message: 'All fields are required.', status: false },
          { status: 400 }
        );
      }
  
      const updatedSocialMedia = await prisma.socialMedia.update({
        where: { id: parseInt(id, 10) }, // Ensure ID is treated as a number
        data: {
          facebook: data.facebook,
          instagram: data.instagram,
          twitter: data.twitter,
          tiktok: data.tiktok,
          pinterest: data.pinterest,
          updatedAt: new Date(), // Update the timestamp to the current time
        },
      });
  
      return NextResponse.json({
        status: true,
        message: 'Social media links updated successfully',
        data: updatedSocialMedia,
      });
    } catch (error) {
      console.error(`Error updating social media links for ID ${id}:`, error);
      return NextResponse.json(
        { message: 'Failed to update social media links', status: false, error: error.message },
        { status: 500 }
      );
    }
  }

// Delete social media links by ID
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const deletedSocialMedia = await prisma.socialMedia.delete({
      where: { id: parseInt(id) }, // Ensure ID is treated as a number
    });
    return NextResponse.json({ status: true, message: 'Social media links deleted successfully', data: deletedSocialMedia });
  } catch (error) {
    console.error(`Error deleting social media links for ID ${id}:`, error);
    return NextResponse.json({ message: 'Failed to delete social media links', status: false, error: error.message }, { status: 500 });
  }
}
