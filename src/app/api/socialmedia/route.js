import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';// Adjust the path based on your project structure

// Create or update social media links
export async function POST(request) {
    const data = await request.json();
    
    try {
      const { id, facebook, instagram, twitter, tiktok, pinterest } = data;
  
      if (id) {
        // Update the existing record
        const updatedSocialMedia = await prisma.socialMedia.update({
          where: { id },
          data: {
            facebook,
            instagram,
            twitter,
            tiktok,
            pinterest,
          },
        });
        return NextResponse.json({ status: true, data: updatedSocialMedia });
      } else {
        // Create a new record
        const newSocialMedia = await prisma.socialMedia.create({
          data: {
            facebook,
            instagram,
            twitter,
            tiktok,
            pinterest,
          },
        });
        return NextResponse.json({ status: true, data: newSocialMedia });
      }
    } catch (error) {
      console.error('Error creating or updating social media links:', error);
      return NextResponse.json(
        { message: 'Failed to create or update social media links', status: false, error: error.message },
        { status: 500 }
      );
    }
  }
// Fetch social media links
// export async function GET() {
//   try {
//     const socialMedia = await prisma.socialMedia.findUnique({
//       where: { id: 1 }, // Assuming a single entry for social media links
//     });

//     if (!socialMedia) {
//       return NextResponse.json({ message: 'No social media links found', status: false }, { status: 404 });
//     }

//     return NextResponse.json({ status: true, data: socialMedia });
//   } catch (error) {
//     console.error('Error fetching social media links:', error);
//     return NextResponse.json({ message: 'Failed to fetch social media links', status: false, error: error.message }, { status: 500 });
//   }
// }



export async function GET() {
    try {
      const socialMediaLinks = await prisma.socialMedia.findMany();
  
      if (!socialMediaLinks || socialMediaLinks.length === 0) {
        return NextResponse.json(
          { message: 'No social media links found', status: false },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ status: true, data: socialMediaLinks });
    } catch (error) {
      console.error('Error fetching social media links:', error);
      return NextResponse.json(
        { message: 'Failed to fetch social media links', status: false, error: error.message },
        { status: 500 }
      );
    }
  }
// Delete social media links (optional)
export async function DELETE() {
  try {
    const deletedSocialMedia = await prisma.socialMedia.delete({
      where: { id: 1 }, // Assuming a single entry for social media links
    });
    return NextResponse.json({ status: true, message: 'Social media links deleted successfully', data: deletedSocialMedia });
  } catch (error) {
    console.error('Error deleting social media links:', error);
    return NextResponse.json({ message: 'Failed to delete social media links', status: false, error: error.message }, { status: 500 });
  }
}
