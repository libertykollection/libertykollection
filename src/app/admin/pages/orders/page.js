'use client';
import { useState, useEffect } from 'react';
import FilterableTable from './FilterableTable';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full">
      <FilterableTable data={orders} fetchData={fetchData} />
    </div>
  );
};

export default OrdersPage;
