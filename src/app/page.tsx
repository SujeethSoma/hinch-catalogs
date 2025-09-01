import ClientGrid from "./ClientGrid";

export const metadata = {
  title: "HINCH Catalogues",
  description: "Explore, preview, and download product catalogs from HINCH.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container section">
          <h1 className="heading">HINCH Catalogues</h1>
          <p className="subtle mt-2">Explore, preview, and download product catalogs.</p>
          <div className="h-1 w-24 mt-6 rounded-full brand-gradient" />
        </div>
      </div>
      
      {/* Main Content */}
      <ClientGrid />
    </main>
  );
}

