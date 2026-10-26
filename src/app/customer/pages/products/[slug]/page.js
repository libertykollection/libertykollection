// app/customer/pages/products/[slug]/page.js

import ProductPage from './product';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '../../../../util/prisma';

/**
 * Fetches product data from the API
 * @param {string} slug - Product slug identifier
 * @returns {Promise<Object|null>} Product data or null if error
 */
async function getProductData(slug) {
  if (!slug) {
    return null;
  }

  try {
    // Decode the slug to handle special characters properly
    const decodedSlug = decodeURIComponent(slug);

    // Get headers for server-side fetch (Next.js 15+)
    const headersList = await headers();

    // Get host - check x-forwarded-host first (Vercel/proxy), then host
    const forwardedHost = headersList.get('x-forwarded-host');
    const host = forwardedHost || headersList.get('host') || 'localhost:3000';

    // Get protocol - check x-forwarded-proto first (Vercel/proxy), then determine from env
    const forwardedProto = headersList.get('x-forwarded-proto');
    let protocol = 'http';
    if (forwardedProto) {
      protocol = forwardedProto.split(',')[0].trim(); // Take first protocol if multiple
    } else if (process.env.NODE_ENV === 'production') {
      protocol = 'https';
    }

    // Construct base URL - prefer dynamic host from headers in production
    // to avoid issues with hardcoded NEXT_PUBLIC_API_URL (like localhost:3000)
    let baseUrl = `${protocol}://${host}`;
    if (!host && process.env.NEXT_PUBLIC_API_URL) {
      baseUrl = process.env.NEXT_PUBLIC_API_URL;
    }

    // Build the API URL - use the decoded slug directly
    const apiUrl = `${baseUrl}/api/products/${decodedSlug}`;

    // Use ISR (Incremental Static Regeneration) for better performance
    const res = await fetch(apiUrl, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      if (res.status === 404) {
        return null;
      }
      // Log error for debugging
      console.error(`Failed to fetch product: ${res.status} - ${res.statusText} - URL: ${apiUrl}`, errorBody);
      return null;
    }

    const data = await res.json();

    if (!data?.data) {
      console.error('Product data structure is invalid:', data);
      return null;
    }

    return data.data;
  } catch (error) {
    // Log errors for debugging
    console.error('Error fetching product data:', error.message, error.stack);
    return null;
  }
}

/**
 * Generates metadata for SEO
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const productData = await getProductData(slug);

  let brandName = 'Official Store';
  try {
    const details = await prisma.companyDetails.findFirst();
    if (details?.name) brandName = details.name;
  } catch (e) {}

  if (!productData?.product) {
    return {
      title: `Product Not Found | ${brandName}`,
      description: 'The product you are looking for could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { product } = productData;
  const title = product.meta_title || product.name || 'Product Details';
  const description = product.meta_description ||
    `Shop ${product.name} at ${brandName}. ${product.description ? product.description.substring(0, 150) : 'Quality products at great prices.'}`;

  return {
    title: `${title} | ${brandName}`,
    description,
    keywords: product.meta_keywords || product.name,
    openGraph: {
      title: `${title} | ${brandName}`,
      description,
      type: 'website',
      images: product.images?.[0]?.url ? [
        {
          url: product.images[0].url.startsWith('http') || product.images[0].url.startsWith('data:')
            ? product.images[0].url
            : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url}`,
          alt: product.name,
        }
      ] : [],
    },
    alternates: {
      canonical: `/customer/pages/products/${product.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${brandName}`,
      description,
    },
  };
}

/**
 * Product Details Page Component
 * Server component that fetches product data and renders the client component
 */
const ProductDetailsPage = async ({ params }) => {
  try {
    const { slug } = await params;

    if (!slug) {
      return notFound();
    }

    const productData = await getProductData(slug);

    const { product } = productData;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://libertykollection.com';

    // Construct Product Schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images?.[0]?.url ? (
        product.images[0].url.startsWith('http') || product.images[0].url.startsWith('data:')
          ? product.images[0].url
          : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${product.images[0].url}`
      ) : [],
      description: product.description,
      sku: product.sku || product.slug,
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/customer/pages/products/${product.slug}`,
        priceCurrency: 'PKR',
        price: product.price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ProductPage productData={productData} />
      </>
    );
  } catch (error) {
    console.error('Error in ProductDetailsPage:', error);
    return notFound();
  }
};

export default ProductDetailsPage;
