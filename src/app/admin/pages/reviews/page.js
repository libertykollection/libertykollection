'use client'
import React, { useEffect, useState } from 'react';
import ReviewableTable from './Filterabletable';
// import ReviewableTable from '../components/ReviewableTable'; // Adjust the path as needed

export default function Page() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/allproducts');
      const data = await res.json();
      if (res.ok) {
        setProducts(data); // Make sure products are set here
      } else {
        console.error('Failed to fetch products:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch reviews from the API (assuming you have a similar API for reviews)
  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      } else {
        console.error('Failed to fetch reviews:', data.message);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch products when component mounts
    fetchReviews();  // Fetch reviews when component mounts
  }, []);

  return (
    <div>
      <ReviewableTable
        reviews={reviews}
        fetchReviews={fetchReviews}
        products={products} // Passing products to the table
      />
    </div>
  );
}
