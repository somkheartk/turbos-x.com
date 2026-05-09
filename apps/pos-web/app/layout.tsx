import './globals.css';
import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import { ReactNode } from 'react';

const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Smartstore Console',
  description: 'Next.js frontend prepared for Google Cloud Run deployment.'
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={kanit.className}>{children}</body>
    </html>
  );
}
