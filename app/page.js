// app/page.js

import Link from "next/link"
import { getFeaturedProducts, getCategories } from "@/lib/api"
import ProductCard from "@/components/ProductCard"

export default async function Home() {
  // fetch both on the server — instant load, no spinner
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories()
  ])

  return (
    <main>

      {/* ── Hero Banner ─────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Everything you need,<br />all in one place
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Quality clothing, footwear, and accessories — delivered to your door.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* ── Shop by Category ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(category => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group bg-gray-50 rounded-xl p-6 text-center hover:bg-yellow-50 border border-gray-100 hover:border-yellow-300 transition-colors"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:bg-yellow-200">
                <span className="text-yellow-700 font-bold text-lg">
                  {category.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="font-medium text-gray-900 capitalize">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ───────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link href="/products" className="text-yellow-700 hover:underline text-sm font-medium">
            View all →
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No featured products yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Trust badges ─────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-semibold text-gray-900">Free Shipping</p>
            <p className="text-sm text-gray-500 mt-1">On all orders above ₹999</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Secure Payments</p>
            <p className="text-sm text-gray-500 mt-1">100% secure checkout</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Easy Returns</p>
            <p className="text-sm text-gray-500 mt-1">7-day return policy</p>
          </div>
        </div>
      </section>
    </main>
  )
}