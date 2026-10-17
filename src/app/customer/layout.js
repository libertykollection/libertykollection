'use client';

import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import NewsletterBar from './components/NewsletterBar';
import '../globals.css';
import WhatsAppButton from './components/whatsappbutton';

const CustomerLayout = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [pixelCode, setPixelCode] = useState('');

  useEffect(() => {
    setIsClient(true);

    const fetchPixelCode = async () => {
      try {
        const response = await fetch('/api/pixels');
        const data = await response.json();
        if (data?.data?.length > 0) {
          setPixelCode(data.data[0].pixelCode);
        }
      } catch (error) {
        console.error('Error fetching pixel code:', error);
      }
    };

    fetchPixelCode();
  }, []);

  return (
    <>
      {pixelCode && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelCode}'); 
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header />
        <main className="flex-grow">
          {isClient && <WhatsAppButton />}
          {children}
        </main>
        <NewsletterBar />
        <Footer />
      </div>
    </>
  );
};

export default CustomerLayout;
