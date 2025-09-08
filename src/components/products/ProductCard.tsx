"use client";

import Image from "next/image";
import { Product, calcDiscount, money } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = calcDiscount(product);
  const isNew = product.tags?.includes("NEW");
  const isPopular = product.rating > 4.6;
  
  // Safe fallback for image URL
  const img = product.image_url || '/placeholder.png';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-50">
        <Image
          src={img}
          alt={product.design_name}
          fill
          className="object-cover"
          // unoptimized={true} // Uncomment for debugging R2 images if needed
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.png';
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              NEW
            </span>
          )}
          {isPopular && (
            <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              POPULAR
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Brand and Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#F46300]">{product.brand}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
          {product.design_name}
        </h3>

        {/* Meta Information */}
        <div className="space-y-1 text-xs text-gray-600">
          {product.finish && (
            <div className="flex justify-between">
              <span>Finish:</span>
              <span className="font-medium">{product.finish}</span>
            </div>
          )}
          {product.size && (
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-medium">{product.size}</span>
            </div>
          )}
          {product.thickness && (
            <div className="flex justify-between">
              <span>Thickness:</span>
              <span className="font-medium">{product.thickness}</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs font-medium text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {money(product.selling_price)}
            </span>
            <span className="text-sm text-gray-500 line-through">
              {money(product.mrp)}
            </span>
          </div>
          {discount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
              Save {discount}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200">
            Preview
          </button>
          <button className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#F46300] rounded-lg hover:bg-[#CC380A] transition-colors duration-200">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

