// Fetch subcategory data server-side
import { notFound } from 'next/navigation';
import SubcategoryPage from './SubcategoryPage';
import { headers } from 'next/headers';

// Fetch subcategory data server-side
async function getSubcategoryData(slug) {
  if (!slug) {
    return null;
  }

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';

    // Construct base URL
    let baseUrl = `${protocol}://${host}`;

    // Fallback or override if specifically configured
    if (process.env.NEXT_PUBLIC_API_URL && !host.includes('store2u.ca') && !host.includes('vercel.app')) {
      baseUrl = process.env.NEXT_PUBLIC_API_URL;
    }

    const apiUrl = `${baseUrl}/api/subcatdetail/${slug}`;

    // Use ISR (Incremental Static Regeneration) for better performance
    const res = await fetch(apiUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching subcategory data:', res.statusText);
      }
      return null;
    }

    const data = await res.json();

    if (!data?.data) {
      return null;
    }

    return data.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching subcategory data:', error);
    }
    return null;
  }
}

// Metadata generation
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const subcategory = await getSubcategoryData(slug);

  if (!subcategory) {
    return {
      title: 'Subcategory not found',
      description: 'No subcategory information available',
    };
  }

  // Return metadata based on fetched subcategory details
  return {
    title: subcategory.meta_title || subcategory.name || 'Subcategory Title',
    description: subcategory.meta_description || 'Subcategory Description',
    keywords: subcategory.meta_keywords || 'Subcategory Keywords',
  };
}

const SubcategoryDetailsPage = async ({ params }) => {
  const { slug } = await params;

  // Fetch the subcategory data
  const subcategory = await getSubcategoryData(slug);

  // Handle subcategory not found
  if (!subcategory) {
    return notFound(); // Use Next.js built-in 404 handling
  }

  // Return the SubcategoryPage component with the fetched subcategory data
  return <SubcategoryPage subcategoryData={subcategory} />;
};

export default SubcategoryDetailsPage;