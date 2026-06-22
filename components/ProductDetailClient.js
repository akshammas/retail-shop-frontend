// components/ProductDetailClient.js

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authFetch } from "@/lib/api"
import ProductCard from "@/components/home/ProductCard"

export default function ProductDetailClient({ product, related }) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)
  const [adding, setAdding] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)
  const [message, setMessage] = useState(null)

  const sizes = product.available_sizes
    ? product.available_sizes.split(",").map(s => s.trim()).filter(Boolean)
    : []

  const needsSize = sizes.length > 0
  const sizeMissing = needsSize && !selectedSize

  async function handleAddToCart() {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }
    if (sizeMissing) {
      setMessage({ type: "error", text: "Please select a size" })
      return
    }

    try {
      setAdding(true)
      const res = await authFetch("/orders/cart", {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity }),
      })
      if (!res.ok) throw new Error()
      setMessage({ type: "success", text: "Added to cart" })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: "error", text: "Failed to add to cart" })
    } finally {
      setAdding(false)
    }
  }

  // components/ProductDetailClient.js — replace handleBuyNow only

  async function handleBuyNow() {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }
    if (sizeMissing) {
      setMessage({ type: "error", text: "Please select a size" })
      return
    }

    // no cart call at all — just carry the product + qty straight to checkout
    const params = new URLSearchParams({
      buyNow: "true",
      productId: product.id,
      qty: quantity,
    })
    router.push(`/checkout?${params.toString()}`)
  }

  const imageUrl = product.images?.length > 0
    ? `http://localhost:8000${product.images[selectedImage].image_url}`
    : null

  return (
    <main className="px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* ── Images ─────────────────────────── */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-gray-900" : "border-transparent"
                    }`}
                  >
                    <img
                      src={`http://localhost:8000${img.image_url}`}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ───────────────────────────── */}
          <div className="flex flex-col">

            {product.brand && (
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                {product.brand}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {product.name}
            </h1>

            <span className={`mt-3 inline-block w-fit text-sm px-3 py-1 rounded-full font-medium ${
              product.in_stock
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {product.in_stock ? `In Stock (${product.quantity} left)` : "Out of Stock"}
            </span>

            {/* Price */}
            {product.is_on_sale ? (
              <div className="flex items-center gap-3 mt-6">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{product.discounted_price.toLocaleString()}
                </p>
                <p className="text-lg text-gray-400 line-through">
                  ₹{product.price.toLocaleString()}
                </p>
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {product.discount_percent}% OFF
                </span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-6">
                ₹{product.price.toLocaleString()}
              </p>
            )}

            {/* About this item */}
            {product.description && (
              <div className="mt-8">
                <h2 className="font-semibold text-gray-900 mb-2">About this item</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Size selector */}
            {needsSize && (
              <div className="mt-8">
                <h2 className="font-semibold text-gray-900 mb-3">Select Size</h2>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-8">
              <h2 className="font-semibold text-gray-900 mb-3">Quantity</h2>
              <div className="flex items-center border border-gray-200 rounded-lg w-fit overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 font-medium"
                >
                  −
                </button>
                <span className="px-5 py-2 border-x border-gray-200 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mt-6 px-4 py-3 rounded-lg text-sm font-medium ${
                message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}>
                {message.text}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock || adding || buyingNow}
                className="flex-1 py-4 rounded-full font-semibold border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.in_stock || adding || buyingNow}
                className="flex-1 py-4 rounded-full font-semibold bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {buyingNow ? "Processing..." : "Buy Now"}
              </button>
            </div>

            {/* Specs */}
            <div className="mt-10 border-t border-gray-100 pt-6">
              <h2 className="font-semibold text-gray-900 mb-3">Specifications</h2>
              <dl className="text-sm space-y-2">
                {product.brand && (
                  <div className="flex">
                    <dt className="w-32 text-gray-400">Brand</dt>
                    <dd className="text-gray-900">{product.brand}</dd>
                  </div>
                )}
                {product.category_id && (
                  <div className="flex">
                    <dt className="w-32 text-gray-400">Category</dt>
                    <dd className="text-gray-900 capitalize">
                      Category #{product.category_id}
                    </dd>
                  </div>
                )}
                <div className="flex">
                  <dt className="w-32 text-gray-400">Availability</dt>
                  <dd className="text-gray-900">
                    {product.in_stock ? "In stock" : "Out of stock"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* ── Related products ────────────────── */}
        {related.length > 0 && (
          <section className="mt-24 pt-16 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}