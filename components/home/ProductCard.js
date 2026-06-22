// components/home/ProductCard.js

"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authFetch } from "@/lib/api"
import { useWishlist } from "@/components/WishlistProvider"

export default function ProductCard({ product }) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const { isWishlisted, toggle } = useWishlist()
  const liked = isWishlisted(product.id)

  async function handleQuickAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }
    try {
      setAdding(true)
      await authFetch("/orders/cart", {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  function handleWishlistToggle(e) {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id, () => router.push("/login"))
  }

  const imageUrl = product.images?.length > 0
    ? `http://localhost:8000${product.images[0].image_url}`
    : null

  return (
    // ── wrapper is now a plain div, NOT a Link ──────────
    <div className="group relative block">

      {/* the Link only covers the image + text, not the whole card anymore */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}

          {!product.in_stock && (
            <span className="absolute top-3 left-3 bg-white/90 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
              Out of stock
            </span>
          )}

          {product.is_on_sale && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {product.discount_percent}% OFF
            </span>
          )}
        </div>

        <h3 className="font-medium text-gray-900 truncate group-hover:text-gray-600 transition-colors">
          {product.name}
        </h3>

        {product.is_on_sale ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-900 font-semibold">
              ₹{product.discounted_price.toLocaleString()}
            </span>
            <span className="text-gray-400 text-sm line-through">
              ₹{product.price.toLocaleString()}
            </span>
          </div>
        ) : (
          <p className="text-gray-900 font-semibold mt-1">
            ₹{product.price.toLocaleString()}
          </p>
        )}
      </Link>

      {/* heart button is now OUTSIDE the Link, just absolutely positioned over the card */}
      <button
        onClick={handleWishlistToggle}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={liked}
        className={`absolute z-20 ${product.in_stock ? "top-3" : "top-12"} left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-colors hover:bg-white`}
      >
        <HeartIcon filled={liked} />
      </button>
    </div>
  )
}



function HeartIcon({ filled }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? "#ef4444" : "none"}
      stroke={filled ? "#ef4444" : "#374151"}
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}