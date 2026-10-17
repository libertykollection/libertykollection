'use client';

import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const AdminLayout = ({ children, setActiveComponent }) => {
  return (
    <div className="min-h-screen flex bg-[#F8F9FA] text-gray-900 font-sans">
      {/* Sidebar with luxury deep espresso background */}
      <aside className="w-[270px] flex-shrink-0 bg-[#141311] border-r border-[#241720] z-30">
        <Sidebar setActiveComponent={setActiveComponent} />
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
