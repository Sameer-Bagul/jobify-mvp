import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JobSeeker Pro',
  description: 'Job seeker platform with cold email automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
