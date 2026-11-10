import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atölye Ayane',
  description: 'Canlı Satış Yönetim Paneli',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-[#FAF9F6] min-h-screen text-gray-800">
        {children}
      </body>
    </html>
  );
}
