import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NaijaList — Nigeria Business Directory | Find Local Businesses',
    template: '%s | NaijaList',
  },
  description:
    'Discover and contact Nigerian businesses near you. Browse restaurants, shops, clinics, professionals, and more across Enugu State. Nigeria\'s most trusted business directory.',
  keywords: [
    'Nigeria business directory',
    'Enugu businesses',
    'find businesses Nigeria',
    'Nigerian SMEs',
    'business listings Nigeria',
    'NaijaList',
  ],
  metadataBase: new URL('https://naijalist.com.ng'),
  openGraph: {
    type: 'website',
    siteName: 'NaijaList',
    title: 'NaijaList — Nigeria Business Directory',
    description: 'Find trusted local businesses across Nigeria. Verified listings, WhatsApp contact, real reviews.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NaijaList — Nigeria Business Directory',
    description: 'Find trusted local businesses across Nigeria.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#008751" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
