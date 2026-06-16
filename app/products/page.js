// app/products/page.js

"use client"

import { useState, useEffect } from "react"
import { getProducts, getCategories } from "@/lib/api"
import ProductCard from "@/components/ProductCard"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"

export default function ProductsPage() {
  // ── State ─────────────────────────────────────────
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState("")

  // ── Fetch products whenever filters change ────────
  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])  // ← runs again when category changes

  async function fetchProducts() {
    try {
      setLoading(true)
      setError(null)

      // build params object
      const params = { limit: 12 }
      if (selectedCategory) params.category = selectedCategory
      if (search) params.search = search

      const data = await getProducts(params)
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch categories once on load ─────────────────
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error)
  }, [])  // ← empty array = runs only once


  // ── Handle search ─────────────────────────────────
  function handleSearch(e) {
    e.preventDefault()
    fetchProducts()
  }

  // ── Render ────────────────────────────────────────
  if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        // Empty state
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found</p>
          <button
            onClick={() => {
              setSelectedCategory(null)
              setSearch("")
            }}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        // Products grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Product count */}
      {!loading && products.length > 0 && (
        <p className="text-gray-400 text-sm mt-6 text-center">
          Showing {products.length} products
        </p>
      )}
    </main>
  )
}