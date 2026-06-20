// app/page.js

import Link from "next/link"
import { getFeaturedProducts, getProducts, getCategories } from "@/lib/api"
import CategoryGrid from "@/components/home/CategoryGrid"
import ProductGrid from "@/components/home/ProductGrid"
import NewsletterForm from "@/components/home/NewsletterForm"

export default async function Home() {
  const [trending, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getProducts({ limit: 10 }),
    getCategories(),
  ])

  // for each category, grab one in-stock product that has an image
  const categoriesWithImages = await Promise.all(
    categories.map(async (cat) => {
      try {
        const products = await getProducts({
          category: cat.id,
          limit: 1,
          in_stock: true,
        })
        const imageUrl = products[0]?.images?.[0]?.image_url || null
        return { ...cat, imageUrl }
      } catch {
        return { ...cat, imageUrl: null }
      }
    })
  )

  return (
    <main>
      {/* ── Hero ─────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 pt-20 md:pt-28 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full mb-6">
              New Season
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tight">
              Quality essentials,
              <br />
              made simple.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed">
              Clothing, footwear, and accessories that last. No clutter,
              no gimmicks — just the things you actually wear.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="bg-gray-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                Shop the collection
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 rounded-full font-semibold text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Browse categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ─────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Shop by category
            </h2>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              View all
              <span aria-hidden>→</span>
            </Link>
          </div>
          <CategoryGrid categories={categoriesWithImages} />
        </div>
      </section>

      {/* ── Trending ──────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Trending now
              </h2>
              <p className="mt-2 text-gray-500">
                The pieces everyone's adding to cart this week
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              View all
              <span aria-hidden>→</span>
            </Link>
          </div>
          <ProductGrid products={trending} emptyLabel="No trending products yet" />
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                New arrivals
              </h2>
              <p className="mt-2 text-gray-500">Fresh additions to the catalog</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              View all
              <span aria-hidden>→</span>
            </Link>
          </div>
          <ProductGrid products={newArrivals} emptyLabel="No products yet" />
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-7xl mx-auto bg-gray-900 rounded-3xl px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Get early access
            </h2>
            <p className="mt-3 text-gray-400">
              New drops, restock alerts, and member-only discounts — straight
              to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </main>
  )
}