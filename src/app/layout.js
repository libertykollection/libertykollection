import { Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import ClientLayout from './ClientLayout';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

import prisma from './util/prisma';

export async function generateMetadata() {
  let title = 'Prestige Online Atelier';
  let description = 'Shop luxury authentic cosmetics, niche fragrances, and verified skincare.';
  let icon = '/store2ulogo.png';

  try {
    const details = await prisma.companyDetails.findFirst();
    if (details) {
      if (details.name) {
        title = `${details.name} - Official Store`;
      }
      if (details.description) {
        description = details.description;
      }
      if (details.favIcon) {
        const uploadUrl = process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL || '';
        icon = details.favIcon.startsWith('http') || details.favIcon.startsWith('/')
          ? details.favIcon
          : `${uploadUrl}/${details.favIcon}`;
      }
    }
  } catch (err) {
    console.error('Error fetching dynamic branding in layout:', err);
  }

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://store2u.ca'),
    title,
    description,
    manifest: '/manifest.json',
    icons: {
      icon,
      apple: icon,
    },
    alternates: {
      canonical: '/',
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${poppins.variable}`}>
      <body className={`${plusJakartaSans.className} font-sans antialiased`} suppressHydrationWarning={true}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

