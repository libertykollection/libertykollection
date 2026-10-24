import { Cormorant_Garamond, DM_Sans, Jost } from 'next/font/google';
import ClientLayout from './ClientLayout';
import './globals.css';

/* ─── Display / Heading serif — luxury editorial feel ─── */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

/* ─── Body / UI — clean geometric sans ─── */
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

/* ─── Labels / Navigation — modern humanist caps ─── */
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
});

import prisma from './util/prisma';

export async function generateMetadata() {
  let title = 'Gloria Cosmetics - Official Online Store';
  let description = 'Shop luxury authentic cosmetics, niche fragrances, and verified skincare.';
  let icon = '/gloria_logo.png';

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
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://gloriacosmetics.pk'),
    title,
    description,
    manifest: '/manifest.json',
    icons: {
      icon: '/gloria_logo.png',
      shortcut: '/favicon.ico',
      apple: '/gloria_logo.png',
    },
    alternates: {
      canonical: '/',
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} ${jost.variable}`}>
      <body className={`${dmSans.className} font-sans antialiased`} suppressHydrationWarning={true}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

