// components/home/ProductGrid.js

import ProductCard from "./ProductCard"

export default function ProductGrid({ products, emptyLabel }) {
  if (!products || products.length === 0) {
    return <p className="text-center text-gray-400 py-16">{emptyLabel}</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}