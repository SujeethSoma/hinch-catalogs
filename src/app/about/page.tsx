import Link from "next/link";

export const metadata = {
  title: "About HINCH - Your Trusted Partner for Quality Materials",
  description: "Learn about HINCH, your trusted partner for quality materials and solutions. Discover our commitment to excellence and customer satisfaction.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#414042] mb-4">About HINCH</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for quality materials and innovative solutions
          </p>
        </div>

        {/* Who We Are */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#414042] mb-6">Who We Are</h2>
              <p className="text-gray-600 mb-4">
                HINCH has been a leading provider of high-quality materials and solutions for years. 
                We specialize in decorative laminates, louvers, wall panels, moulders, and other 
                premium building materials that meet the highest standards of quality and durability.
              </p>
              <p className="text-gray-600">
                Our commitment to excellence and customer satisfaction has made us a trusted partner 
                for architects, designers, contractors, and homeowners across the region.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#F46300] mb-2">500+</div>
                <div className="text-gray-600">Product Catalogs</div>
              </div>
            </div>
          </div>
        </section>

        {/* Materials We Carry */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#414042] mb-8 text-center">Materials We Carry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Decorative Laminates",
              "PVC Laminates", 
              "Acrylic Laminates",
              "360 Louvers",
              "Wall Panels",
              "Moulders",
              "Ti Patti",
              "Liners",
              "Hardware"
            ].map((material) => (
              <div key={material} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-[#F46300] transition-colors duration-200">
                <div className="text-lg font-medium text-gray-900">{material}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose HINCH */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#414042] mb-8 text-center">Why Choose HINCH</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-md transition-shadow duration-200">
              <div className="w-16 h-16 bg-[#F46300] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#414042] mb-4">Quality Assurance</h3>
              <p className="text-gray-600">
                We source only the finest materials from trusted manufacturers, ensuring every product meets our high standards.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-md transition-shadow duration-200">
              <div className="w-16 h-16 bg-[#F46300] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#414042] mb-4">Fast Delivery</h3>
              <p className="text-gray-600">
                Our efficient logistics network ensures quick and reliable delivery of your materials when you need them.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-md transition-shadow duration-200">
              <div className="w-16 h-16 bg-[#F46300] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#414042] mb-4">Expert Support</h3>
              <p className="text-gray-600">
                Our knowledgeable team provides expert guidance and support to help you find the perfect solutions for your projects.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-[#F46300] rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Work With Us?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us today to discuss your project requirements
            </p>
            <Link
              href="/contact"
              className="bg-white text-[#F46300] px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}



