import React from 'react';
import CatalogCardPreview from './CatalogCardPreview';

interface CatalogGridProps {
  items: any[];
  onClick?: (item: any) => void;
  emptyText?: string;
}

export function CatalogGrid({ items, onClick, emptyText = "No items found" }: CatalogGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 text-center">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <CatalogCardPreview 
          key={index} 
          item={item} 
        />
      ))}
    </div>
  );
}

export default CatalogGrid;