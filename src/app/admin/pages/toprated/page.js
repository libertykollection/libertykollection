'use client';

import React, { useEffect, useState } from 'react';
import FilterableTable from './FilterableTable';

const TopRatedProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products/topRated');
        const data = await response.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to fetch top-rated products', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopRatedProducts();
  }, []);

  return (
    <>
      {isLoading && (
        <div
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div className="s2u-progress-bar-primary" />
        </div>
      )}
      <FilterableTable products={products} isPageLoading={isLoading} />
    </>
  );
};

export default TopRatedProductsPage;
