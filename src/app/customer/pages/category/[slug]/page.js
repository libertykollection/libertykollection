import { notFound } from 'next/navigation';
import CategoryPage from './CategoryPage';
import { headers } from 'next/headers';
import prisma from '../../../../util/prisma';

/**
 * Fetches category data from the API
 * @param {string} slug - Category slug identifier
 * @returns {Promise<Object|null>} Category data or null if error
 */
async function getCategoryData(slug) {
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

    const apiUrl = `${baseUrl}/api/categories/${slug}`;

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
      throw new Error(`Failed to fetch category: ${res.status}`);
    }

    const data = await res.json();

    if (!data?.data) {
      return null;
    }

    return data.data;
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching category data:', error);
    }
    return null;
  }
}

/**
 * Generates metadata for SEO
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  let brandName = 'Official Store';
  try {
    const details = await prisma.companyDetails.findFirst();
    if (details?.name) brandName = details.name;
  } catch (e) {}

  if (!slug) {
    return {
      title: `Category Not Found | ${brandName}`,
      description: 'The category you are looking for could not be found.',
    };
  }

  const category = await getCategoryData(slug);

  if (!category) {
    return {
      title: `Category Not Found | ${brandName}`,
      description: 'The category you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = category.meta_title || category.name || 'Category';
  const description = category.meta_description ||
    `Browse ${category.name} products at ${brandName}. Find quality products in this category.`;

  return {
    title: `${title} | ${brandName}`,
    description,
    keywords: category.meta_keywords || category.name,
    openGraph: {
      title: `${title} | ${brandName}`,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `/customer/pages/category/${category.slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${title} | ${brandName}`,
      description,
    },
  };
}

/**
 * Category Details Page Component
 * Server component that fetches category data and renders the client component
 */
const CategoryDetailsPage = async ({ params }) => {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const category = await getCategoryData(slug);

  if (!category) {
    return notFound();
  }

  return <CategoryPage categoryData={category} />;
};

export default CategoryDetailsPage;
