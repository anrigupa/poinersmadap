import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMADAP POINER | Sistem Poin Pelanggaran & Karakter Siswa",
  description: "Aplikasi Web Pemantauan Ketertiban, Poin Pelanggaran, dan Penghargaan Karakter Siswa Terintegrasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
