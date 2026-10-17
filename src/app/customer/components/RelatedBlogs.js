'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const getRandomSelection = (array, count) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const RelatedBlogs = ({ category, currentBlogId }) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [similarStores, setSimilarStores] = useState([]);
  const [similarOffers, setSimilarOffers] = useState([]);
  const [companies, setCompanies] = useState([]); // To store all companies data
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [errorBlogs, setErrorBlogs] = useState(null);
  const [errorStores, setErrorStores] = useState(null);
  const [errorOffers, setErrorOffers] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blog'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data = await response.json();

        // Sort blogs so that blogs with the same category come first and exclude the current blog
        const sortedBlogs = data
          .filter(blog => blog.id !== currentBlogId) // Exclude the current blog
          .sort((a, b) => {
            if (a.category === category && b.category !== category) {
              return -1; // a comes before b
            }
            if (a.category !== category && b.category === category) {
              return 1; // b comes before a
            }
            return 0;
          });

        // Limit to 4 blogs
        setRelatedBlogs(sortedBlogs.slice(0, 4));
      } catch (error) {
        setErrorBlogs(error.message);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }, [category, currentBlogId]);



  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/offers'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }
        const data = await response.json();

        // Randomly select 4 offers
        const randomOffers = getRandomSelection(data, 4);

        setSimilarOffers(randomOffers);
      } catch (error) {
        setErrorOffers(error.message);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchOffers();
  }, [category]);

  const getCompanyLogo = (companyId) => {
    const company = companies.find(company => company.id === companyId);
    return company ? company.comp_logo : null;
  };

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg">
      {/* Related Blogs Section */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Related Blogs</h3>
      {loadingBlogs ? (
        <div className="text-center">Loading...</div>
      ) : errorBlogs ? (
        <div className="text-center text-red-500">{errorBlogs}</div>
      ) : relatedBlogs.length === 0 ? (
        <div className="text-center text-gray-500">No related blogs found.</div>
      ) : (
        <ul>
          {relatedBlogs.map(blog => (
            <li key={blog.id} className="mb-4 flex items-start">
              <Image
                width={100}
                height={100}
                src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${blog.image}`} // Replace with your actual image path
                alt={blog.title}
                className="w-16 h-16 object-cover rounded-lg mr-4"
                loading="lazy"
              />
              <div>
                <Link href={`/customer/pages/blog/${blog.id}`} className="block text-[#F59E0B] hover:underline font-semibold">
                  {blog.title}
                </Link>
                <div
                  className="text-gray-700 text-sm overflow-hidden text-ellipsis"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3, // Limit to 3 lines
                    WebkitBoxOrient: 'vertical',
                  }}
                  dangerouslySetInnerHTML={{ __html: blog.description }}
                >
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}



    </div>
  );
};

export default RelatedBlogs;
