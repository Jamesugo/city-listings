import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pjs',
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
    <html lang="en" suppressHydrationWarning className={plusJakartaSans.className}>
      <head>
        <meta name="theme-color" content="#008751" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
