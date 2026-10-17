'use client';

import React, { useEffect, useState } from 'react';
import FilterableTable from './FilterableTable';

const AdminPage = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin');
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      <FilterableTable data={data} fetchData={fetchData} isPageLoading={isLoading} />
    </>
  );
};

export default AdminPage;
