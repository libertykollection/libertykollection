'use client';

import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('Liberty Kollection');

  useEffect(() => {
    fetch('/api/contactinfo')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data[0]?.phoneNumber) {
          const cleanPhone = data[0].phoneNumber.replace(/[^0-9]/g, '');
          if (cleanPhone) setPhoneNumber(cleanPhone);
        }
      })
      .catch(() => null);

    fetch('/api/companydetails')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.name) setCompanyName(data.name);
      })
      .catch(() => null);
  }, []);

  // Do not render floating button if no phone number is configured
  if (!phoneNumber) return null;

  const handleClick = () => {
    const greeting = encodeURIComponent(`Hello ${companyName}`);
    const url = `https://wa.me/${phoneNumber}?text=${greeting}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed bottom-20 right-6 z-40 cursor-pointer flex items-center justify-center bg-[#25D366] w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="text-white w-6 h-6" />
    </div>
  );
}
