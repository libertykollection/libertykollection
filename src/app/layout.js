import { Figtree, DM_Sans, Kaushan_Script } from 'next/font/google';
import ClientLayout from './ClientLayout';
import './globals.css';

/* ─── Liberty Display / Headings — Figtree font ─── */
const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

/* ─── Liberty Body / UI — DM Sans font ─── */
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

/* ─── Liberty brush-script logo ─── */
const kaushan = Kaushan_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-logo',
  display: 'swap',
});

import prisma from './util/prisma';

export async function generateMetadata() {
  let title = 'Liberty Kollection - Official Online Store';
  let description = 'Shop luxury authentic cosmetics, bridal jewellery, and verified beauty collections. Your Look, Your Liberty.';
  let icon = '/liberty-logo-header.png';

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
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://libertykollection.com'),
    title,
    description,
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    alternates: {
      canonical: '/',
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${figtree.variable} ${dmSans.variable} ${kaushan.variable}`}>
      <body className={`${dmSans.className} font-sans antialiased`} suppressHydrationWarning={true}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

