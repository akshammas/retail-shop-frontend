// components/ProductsClient.js

"use client"

import { useState } from "react"
import { getProducts } from "@/lib/api"
import ProductCard from "@/components/ProductCard"

export default function ProductsClient({
  initialProducts,
  categories,
  initialCategory = null,
  initialSearch = ""
}) {
  const [products, setProducts] = useState(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  // ↑ was useState(null) — now starts from the URL's value
  const [search, setSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(false)

  async function applyFilters(category, searchTerm) {
    try {
      setLoading(true)
      const params = { limit: 12 }
      if (category) params.category = category
      if (searchTerm) params.search = searchTerm
      const data = await getProducts(params)
      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleCategoryClick(catId) {
    setSelectedCategory(catId)
    applyFilters(catId, search)
  }

  function handleSearch(e) {
    e.preventDefault()
    applyFilters(selectedCategory, search)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          type="submit"
          className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-600"
        >
          Search
        </button>
      </form>

      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}