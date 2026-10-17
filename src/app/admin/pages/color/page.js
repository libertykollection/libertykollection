'use client';

import React, { useState, useEffect } from 'react';
import FilterableTable from './filterabletable';

const ColorPage = () => {
  const [colors, setColors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchColors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/colors');
      const data = await response.json();
      setColors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
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
      <FilterableTable colors={colors} fetchColors={fetchColors} isPageLoading={isLoading} />
    </>
  );
};

export default ColorPage;
