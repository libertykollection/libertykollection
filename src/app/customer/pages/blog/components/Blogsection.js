'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const BlogSection = ({ blogs, title, category }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blogsToShow, setBlogsToShow] = useState(4);
  const router = useRouter();

  // Filter blogs by category
  const filteredBlogs = blogs.filter(blog => blog.category === title);

  useEffect(() => {
    // Adjust number of blogs to show based on screen width
    const updateBlogsToShow = () => {
      if (window.innerWidth >= 1024) {
        setBlogsToShow(4);
      } else if (window.innerWidth >= 768) {
        setBlogsToShow(2);
      } else {
        setBlogsToShow(1);
      }
    };

    updateBlogsToShow();
    window.addEventListener('resize', updateBlogsToShow);
    return () => window.removeEventListener('resize', updateBlogsToShow);
  }, []);

  const handlePrevious = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? Math.ceil(filteredBlogs.length / blogsToShow) - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === Math.ceil(filteredBlogs.length / blogsToShow) - 1 ? 0 : prevIndex + 1
    );
  };

  const handleBlogClick = blog => {
    router.push(`/customer/pages/blog/${blog.id}`);
  };

  if (filteredBlogs.length === 0) {
    return null;
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-8 md:p-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {title} Articles
          </h2>
          <p className="text-gray-600">
            Explore our curated collection of {title.toLowerCase()} articles
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {Math.ceil(filteredBlogs.length / blogsToShow)}
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      {filteredBlogs.length > blogsToShow && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-50 hover:scale-110 transition-all duration-300 border-2 border-blue-100"
            aria-label="Previous articles"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white text-blue-600 p-3 rounded-full shadow-lg hover:bg-blue-50 hover:scale-110 transition-all duration-300 border-2 border-blue-100"
            aria-label="Next articles"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Blog Slider */}
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-700 ease-in-out gap-6"
          style={{ transform: `translateX(-${currentIndex * (100 / blogsToShow)}%)` }}
        >
          {filteredBlogs.map((blog, index) => (
            <div
              key={blog.id || index}
              className="flex-shrink-0 cursor-pointer group"
              style={{ flexBasis: `${100 / blogsToShow}%` }}
              onClick={() => handleBlogClick(blog)}
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col border border-gray-100">
                {/* Blog Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    width={800}
                    height={600}
                    src={blog.image ? `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${blog.image}` : "/fallback.jpg"}
                    alt={blog.title || "Blog Image"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Blog Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {blog.category || 'Uncategorized'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h3>
                  <div
                    className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    dangerouslySetInnerHTML={{ __html: blog.description }}
                  />
                  <div className="mt-auto">
                    <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-800 transition-colors">
                      Read More →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {filteredBlogs.length > blogsToShow && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(filteredBlogs.length / blogsToShow) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogSection;
