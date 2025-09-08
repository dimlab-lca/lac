import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LCA TV - Dashboard Administratif',
  description: 'Dashboard de gestion publicitaire et clients pour LCA TV Burkina Faso',
  keywords: 'LCA TV, dashboard, publicité, Burkina Faso, administration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}