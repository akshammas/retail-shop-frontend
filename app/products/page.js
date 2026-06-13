// app/products/page.js

"use client"

import { useState, useEffect } from "react"
import { getProducts } from "@/lib/api"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProducts({ limit: 12 })
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Loading products...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Error: {error}</p>
    </div>
  )

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            {/* product image */}
            <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
              {product.images?.length > 0 ? (
                <img
                  src={`http://localhost:8000${product.images[0].image_url}`}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-400 text-sm">No image</span>
              )}
            </div>

            {/* product info */}
            <h2 className="font-semibold text-gray-900 truncate">{product.name}</h2>
            <p className="text-gray-500 text-sm mt-1 truncate">{product.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-blue-600 font-bold text-lg">
                ₹{product.price.toLocaleString()}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.in_stock
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            
            <a  href={`/products/${product.id}`}
              className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </main>
  )
}