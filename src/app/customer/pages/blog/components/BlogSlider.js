'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogCategorySlider({ category, blogs }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter blogs based on the category
  const filteredBlogs = blogs.filter((blog) => blog.category === category);

  // If there are no blogs in this category, return early
  if (filteredBlogs.length === 0) {
    return (
      <div className="w-full bg-white p-6 shadow-md text-center">
        <h2 className="text-2xl font-bold text-blue-500 mb-4">{category}</h2>
        <p className="text-gray-500">No blogs available in this category.</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? filteredBlogs.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === filteredBlogs.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="w-full bg-white p-6 shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-blue-500 mb-6">{category}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Slider */}
        <div className="relative flex items-center col-span-1 lg:col-span-2">
          <button
            onClick={handlePrevious}
            className="text-white p-3 absolute z-50 bg-yellow-400 left-2 rounded-full hover:scale-110 transition duration-300 shadow-lg"
            aria-label="Previous blog"
          >
            &#10094;
          </button>
          <button
            onClick={handleNext}
            className="text-white p-3 absolute z-50 bg-yellow-400 right-2 rounded-full hover:scale-110 transition duration-300 shadow-lg"
            aria-label="Next blog"
          >
            &#10095;
          </button>

          <div className="relative w-full overflow-hidden rounded-lg shadow-xl bg-gray-100">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {filteredBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="w-full flex-shrink-0"
                  style={{ flexBasis: '100%' }}
                >
                  <Link href={`/customer/pages/blog/${blog.id}`} className="block">
                    <div className="relative w-full h-64 sm:h-80 lg:h-[500px] rounded-lg overflow-hidden">
                      <Image
                        width={1000}
                        height={1000}
                        src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${blog.image}`}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white p-4">
                        <h3 className="text-lg font-semibold line-clamp-2">{blog.title}</h3>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Remaining blogs */}
        <div className="flex flex-col max-h-[700px] overflow-y-auto space-y-4">
          {filteredBlogs
            .slice(currentIndex + 1)
            .concat(filteredBlogs.slice(0, currentIndex))
            .map((blog, index) => (
              <Link 
                key={blog.id} 
                href={`/customer/pages/blog/${blog.id}`}
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-1/3 flex-shrink-0">
                  <Image
                    width={100}
                    height={100}
                    src={`${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${blog.image}`}
                    alt={blog.title}
                    className="w-full h-20 object-cover rounded-lg"
                    unoptimized
                  />
                </div>
                <div className="w-2/3 min-w-0">
                  <h4 className="text-sm font-bold text-gray-700 line-clamp-2 mb-1">{blog.title}</h4>
                  <p 
                    className="text-xs text-gray-500 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: blog.description?.replace(/<[^>]*>/g, '').substring(0, 60) + '...' }}
                  />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
