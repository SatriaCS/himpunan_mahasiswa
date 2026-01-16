import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "Portal Himpunan Mahasiswa",
  description: "Pusat informasi dan kegiatan himpunan mahasiswa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
