import React from "react";
import BlogDetailPage from "./mainpage";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import prisma from "../../../../util/prisma";

export async function generateMetadata({ params }) {
  const { id } = await params;
  let brandName = 'Official Store';
  try {
    const details = await prisma.companyDetails.findFirst();
    if (details?.name) brandName = details.name;
  } catch (e) {}

  try {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    let blog = null;
    const isNumeric = /^\d+$/.test(String(id));

    if (isNumeric) {
      try {
        const res = await fetch(`${baseUrl}/api/blog/${id}`, { cache: 'no-store' });
        if (res.ok) {
          blog = await res.json();
        }
      } catch (e) {}
    }

    if (blog) {
      return {
        title: `${blog.title} | ${brandName}`,
        description: blog.meta_description || (blog.description ? blog.description.substring(0, 160).replace(/<[^>]*>/g, '') : '') || blog.title,
        keywords: blog.meta_focusKeyword || `${brandName} blogs, cosmetics, beauty, shopping tips`,
        alternates: {
          canonical: `/customer/pages/blog/${id}`,
        },
      };
    }

    return {
      title: `Blog | ${brandName}`,
      description: `Explore the latest articles, beauty guides, and trends on ${brandName}.`,
    };
  } catch (error) {
    return {
      title: `Blog | ${brandName}`,
      description: `Explore the latest articles, beauty guides, and trends on ${brandName}.`,
    };
  }
}

export default async function Home({ params }) {
  const { id } = await params;
  let brandName = 'Official Store';
  try {
    const details = await prisma.companyDetails.findFirst();
    if (details?.name) brandName = details.name;
  } catch (e) {}

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  let blog = null;
  const isNumeric = /^\d+$/.test(String(id));

  if (isNumeric) {
    try {
      const res = await fetch(`${baseUrl}/api/blog/${id}`, { cache: 'no-store' });
      if (res.ok) {
        blog = await res.json();
      }
    } catch (e) {}
  }

  if (!blog) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    image: blog.image?.startsWith('http')
      ? blog.image
      : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL || ''}/${blog.image}`,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    description:
      blog.meta_description ||
      (blog.description ? blog.description.substring(0, 160).replace(/<[^>]*>/g, '') : ''),
    author: {
      '@type': 'Organization',
      name: brandName || 'Atelier',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailPage id={id} initialBlog={blog} />
    </>
  );
}
