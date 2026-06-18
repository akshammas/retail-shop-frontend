// components/ProductCard.js

import Link from "next/link"

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">

      {/* Image */}
      <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center overflow-hidden">
        {product.images?.length > 0 ? (
          <img
            src={`http://localhost:8000${product.images[0].image_url}`}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      {/* Info */}
      <h2 className="font-semibold text-gray-900 truncate">{product.name}</h2>
      <p className="text-gray-400 text-xs mt-1 truncate">{product.description}</p>

      {/* Price + Stock */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-yellow-600 font-bold text-lg">
          ₹{product.price.toLocaleString()}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          product.in_stock
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {product.in_stock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Button */}
      <Link
        href={`/products/${product.id}`}
        className="mt-3 block text-center bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors"
      >
        View Details
      </Link>
    </div>
  )
}