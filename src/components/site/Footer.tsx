import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-[#414042] mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Catalogs */}
          <div>
            <h3 className="text-lg font-semibold text-[#414042] mb-4">Catalogs</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/catalogs"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  All Catalogs
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogs?category=Laminates"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  Laminates
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogs?category=Louvers"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  Louvers
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogs?category=Wall Panels"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  Wall Panels
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogs?category=Moulders"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  Moulders
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold text-[#414042] mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#F46300] transition-colors duration-200"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © HINCH {currentYear}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}




