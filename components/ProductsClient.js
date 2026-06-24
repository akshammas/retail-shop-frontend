// components/ProductsClient.js

"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getProducts, getProductsCount } from "@/lib/api"
import ProductCard from "@/components/ProductCard"

export default function ProductsClient({
  initialProducts,
  categories,
  initialCategory = null,
  initialSearch = "",
  initialPage = 1,
  initialTotal = 0,
  pageSize = 12,
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [products, setProducts] = useState(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [search, setSearch] = useState(initialSearch)
  const [page, setPage] = useState(initialPage)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function buildUrl({ category, searchTerm, pageNum }) {
    const qs = new URLSearchParams()
    if (category) qs.set("category", category)
    if (searchTerm) qs.set("search", searchTerm)
    if (pageNum > 1) qs.set("page", pageNum)
    return qs.toString() ? `${pathname}?${qs.toString()}` : pathname
  }

  async function fetchPage({
    category = selectedCategory,
    stockOnly = inStockOnly,
    searchTerm = search,
    pageNum = 1,
  }) {
    try {
      setLoading(true)
      const filterParams = {}
      if (category) filterParams.category = category
      if (searchTerm) filterParams.search = searchTerm
      if (stockOnly) filterParams.in_stock = true

      const [data, countData] = await Promise.all([
        getProducts({ ...filterParams, limit: pageSize, skip: (pageNum - 1) * pageSize }),
        getProductsCount(filterParams),
      ])

      setProducts(data)
      setTotal(countData.total)
      setPage(pageNum)

      router.push(buildUrl({ category, searchTerm, pageNum }), { scroll: false })
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleCategoryClick(catId) {
    setSelectedCategory(catId)
    fetchPage({ category: catId, pageNum: 1 })
  }

  function handleStockToggle() {
    const next = !inStockOnly
    setInStockOnly(next)
    fetchPage({ stockOnly: next, pageNum: 1 })
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchPage({ searchTerm: search, pageNum: 1 })
  }

  function clearFilters() {
    setSelectedCategory(null)
    setInStockOnly(false)
    setSearch("")
    fetchPage({ category: null, stockOnly: false, searchTerm: "", pageNum: 1 })
  }

  function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages || pageNum === page) return
    fetchPage({ pageNum })
  }

  // build the list of page numbers to show, with "…" for gaps on long lists
  function getPageNumbers() {
    const pages = []
    const showAround = 1 // how many pages to show on each side of current

    for (let i = 1; i <= totalPages; i++) {
      const isEdge = i === 1 || i === totalPages
      const isNearCurrent = Math.abs(i - page) <= showAround
      if (isEdge || isNearCurrent) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "…") {
        pages.push("…")
      }
    }
    return pages
  }

  const hasActiveFilters = selectedCategory !== null || inStockOnly || search !== ""

  return (
    <main className="px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          All Products
        </h1>

        <div className="flex flex-col md:flex-row gap-10">

          {/* ── Sidebar ───────────────────────────── */}
          <aside className="w-full md:w-64 shrink-0">
            {/* Mobile toggle — hidden on md+ */}
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="md:hidden w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm font-medium text-gray-700"
            >
              Filters
              <span className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {/* Panel — always visible on md+, toggled on mobile */}
            <div className={`md:sticky md:top-24 space-y-8 ${filtersOpen ? "block" : "hidden"} md:block`}>

              <form onSubmit={handleSearch}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Search
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    Go
                  </button>
                </div>
              </form>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === null
                        ? "bg-yellow-100 text-yellow-800 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    All categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-yellow-100 text-yellow-800 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={handleStockToggle}
                    className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  In stock only
                </label>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-900 underline"
                >
                  Clear all filters
                </button>
              )}

            </div>
          </aside>

          {/* ── Product grid ──────────────────────── */}
          <section className="flex-1">

            <p className="text-sm text-gray-500 mb-6">
              {loading ? "Loading…" : `${total} product${total === 1 ? "" : "s"} found`}
            </p>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {Array.from({ length: pageSize }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-4">No products found</p>
                <button
                  onClick={clearFilters}
                  className="text-yellow-700 hover:underline text-sm font-medium"
                >
                  Clear filters and try again
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* ── Numbered pagination ──────────── */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-12 overflow-x-auto px-2">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 1}
                      aria-label="Previous page"
                      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹
                    </button>

                    {getPageNumbers().map((p, idx) =>
                      p === "…" ? (
                        <span key={`gap-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          aria-current={p === page ? "page" : undefined}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            p === page
                              ? "bg-yellow-500 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page === totalPages}
                      aria-label="Next page"
                      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}