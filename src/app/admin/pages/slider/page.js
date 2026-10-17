'use client';
import { useEffect, useState } from 'react';
import FilterableSliderTable from './filterabletable';

const SliderPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/slider');
      if (response.ok) {
        const result = await response.json();
        setData(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error('Failed to fetch slider data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full">
      <FilterableSliderTable sliders={data} fetchSliders={fetchData} />
    </div>
  );
};

export default SliderPage;
