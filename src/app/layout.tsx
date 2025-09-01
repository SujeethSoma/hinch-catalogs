import "./globals.css";

export const metadata = {
  title: { default: "HINCH", template: "%s | HINCH" },
  description: "HINCH Catalogues and product collections.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}

