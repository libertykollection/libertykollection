import { NextResponse } from 'next/server';
import prisma from '../../util/prisma';// Adjust the path based on your project structure




export async function GET(request) {
    try {
      const socialMediaLinks = await prisma.socialMedia.findFirst(); // Fetch only the first record
      console.log("Social media links are :",socialMediaLinks);
      if (!socialMediaLinks) {
        return NextResponse.json({ status: false, message: 'No social media links found.' }, { status: 404 });
      }
      return NextResponse.json({ status: true, data: socialMediaLinks });
    } catch (error) {
      console.error('Error fetching social media links:', error);
      return NextResponse.json({ status: false, message: 'Failed to fetch social media links', error: error.message }, { status: 500 });
    }
  }