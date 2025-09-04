import { Suspense } from "react";
import ClientGrid from "./ClientGrid";

export const metadata = {
  title: "HINCH Catalogues",
  description: "Explore, preview, and download product catalogs from HINCH.",
};

export default function Page() {
  return (
    <main>
      <div className="bg-white border-b border-gray-200">
        <div className="px-2 sm:px-4 md:px-6 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#414042]">HINCH Catalogues</h1>
          <p className="text-gray-600 mt-1">Explore, preview, and download product catalogs.</p>
          <div className="h-1 w-24 mt-4 rounded-full bg-gradient-to-r from-[#F46300] to-[#FF9B17]" />
        </div>
      </div>
      <Suspense fallback={<div className="px-2 sm:px-4 md:px-6 py-10 text-center">Loading...</div>}>
        <ClientGrid />
      </Suspense>
    </main>
  );
}


