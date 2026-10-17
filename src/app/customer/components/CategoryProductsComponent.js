'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import Image from 'next/image';

const SubcategoryProductsComponent = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subcategoriesResponse = await axios.get('/api/subcategories');
        const subcategoriesData = subcategoriesResponse.data;
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    fetchSubcategories();
  }, []);

  const fetchProducts = async (subcategorySlug) => {
    try {
      const productsResponse = await axios.get(`/api/products?subcategorySlug=${subcategorySlug}`);
      const productsData = productsResponse.data;
      setProducts(productsData);
      setFilteredProducts(productsData.slice(0, productsPerPage));
      setCurrentPage(1);

      // Log products in the terminal including image URLs
      productsData.forEach(product => {
        const imageUrls = product.images.map(image => image.url);
        console.log(`Product ${product.id}: ${product.name}`);
        console.log(`  Image URLs: ${imageUrls.join(', ')}`);
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubcategoryClick = async (subcategorySlug) => {
    setSelectedSubcategorySlug(subcategorySlug);
    await fetchProducts(subcategorySlug);
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    setFilteredProducts(products.slice(startIndex, endIndex));
    setCurrentPage(nextPage);
  };

  const handlePreviousPage = () => {
    const previousPage = currentPage - 1;
    const startIndex = (previousPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    setFilteredProducts(products.slice(startIndex, endIndex));
    setCurrentPage(previousPage);
  };

  const handleProductClick = (slug) => {
    router.push(`/customer/pages/products/${slug}`);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    alert(`${product.name} has been added to the cart.`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h3 className="text-[1.5rem] md:text-[2rem] font-black uppercase tracking-tighter mb-6">Subcategories</h3>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            className={`cursor-pointer p-2 rounded ${selectedSubcategorySlug === subcategory.slug ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} border border-gray-300`}
            onClick={() => handleSubcategoryClick(subcategory.slug)}
          >
            {subcategory.name}
          </button>
        ))}
      </div>

      {selectedSubcategorySlug && (
        <div className="mt-8">
          <h3 className="text-[1.5rem] md:text-[2rem] font-black uppercase tracking-tighter mb-6">Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="group flex flex-col bg-white border border-gray-100 rounded-2em overflow-hidden hover:shadow-xl transition-all duration-300 relative cursor-pointer"
                  onClick={() => handleProductClick(product.slug)}
                >
                  <div className="relative aspect-square bg-[#F3F4FB] overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        width={300}
                        height={220}
                        src={(() => {
                          const img = product.images[0];
                          const url = typeof img === 'string' ? img : img?.url;
                          if (!url) return '/placeholder.png';
                          return (url.startsWith('http') || url.startsWith('data:'))
                            ? url
                            : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${url}`;
                        })()}
                        alt={product.name}
                        className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/fallback-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="text-base font-black text-gray-800 line-clamp-2 mb-2 leading-tight h-[2.5em] group-hover:text-black transition-colors">{product.name}</h4>
                    <div className="mt-auto flex justify-between items-end">
                      <p className="text-base font-black text-black leading-none">Rs.{product.price}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Stock: {product.stock}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center col-span-full py-8 text-gray-500">No products available in this subcategory.</div>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
              onClick={handleNextPage}
              disabled={currentPage * productsPerPage >= products.length}
            >
              <FiChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryProductsComponent;
