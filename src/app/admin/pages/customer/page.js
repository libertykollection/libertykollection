'use client';
import { useEffect, useState } from 'react';
import FilterableCustomerTable from './FilterableCustomerTable';

const fetchCustomers = async () => {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const fetchedCustomers = await fetchCustomers();
    setCustomers(fetchedCustomers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full">
      <FilterableCustomerTable
        customers={customers}
        fetchCustomers={fetchData}
      />
    </div>
  );
}
