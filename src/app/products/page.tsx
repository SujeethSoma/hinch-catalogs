export const metadata = {
  title: "Our Products - HINCH Catalogues",
  description: "Explore our comprehensive range of quality products and materials from HINCH.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#414042] mb-4">Our Products</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive range of quality products and materials
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-2xl p-12">
            <div className="w-24 h-24 bg-[#F46300] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#414042] mb-4">Product Catalog Coming Soon</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We're working on bringing you a comprehensive product catalog with detailed information about all our materials and solutions. 
              In the meantime, you can explore our catalog collections or contact us for more information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/catalogs"
                className="bg-[#F46300] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#CC380A] transition-colors duration-200"
              >
                Browse Catalogs
              </a>
              <a
                href="/contact"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-[#F46300] hover:text-[#F46300] transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
