'use client';
import { useEffect, useState } from 'react';
import FilterableTable from './FilterableTable';

const SubcategoriesPage = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subcategories from the API
  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/subcategories');
      const result = await response.json();

      if (result.status) {
        setSubcategories(result.data); // Extracting data array from result
        console.log('Subcategories:', result.data); // Logging the fetched subcategories
      } else {
        console.error('Failed to fetch subcategories:', result.message);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();

      if (result.status) {
        setCategories(result.data); // Extracting data array from result
        console.log('Categories:', result.data); // Logging the fetched categories
      } else {
        console.error('Failed to fetch categories:', result.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch both subcategories and categories on component mount
  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  return (
    <div className="w-full">
      <FilterableTable
        subcategories={subcategories}
        fetchSubcategories={fetchSubcategories}
        categories={categories}
      />
    </div>
  );
};

export default SubcategoriesPage;
