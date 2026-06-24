"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWishlist } from "@/components/WishlistProvider"

export default function ProductCard({ product }) {
  const router = useRouter()
  const { isWishlisted, toggle } = useWishlist()
  const liked = isWishlisted(product.id)
  const [animating, setAnimating] = useState(false)

  function handleWishlistToggle(e) {
    e.preventDefault()
    e.stopPropagation()
    setAnimating(true)
    toggle(product.id, () => router.push("/login"))
    setTimeout(() => setAnimating(false), 300)
  }

  const imageUrl = product.images?.length > 0
    ? `http://localhost:8000${product.images[0].image_url}`
    : null

  return (
    <Link href={`/products/${product.id}`} className="group block">
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

        {/* Wishlist button — replaces the old Add to Cart button */}
        <button
          onClick={handleWishlistToggle}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-90
            ${liked
              ? "bg-red-500 text-white"
              : "bg-yellow-500 text-gray-900"
            }
            ${animating ? "scale-110" : "scale-100"}
          `}
        >
          {liked ? <CheckIcon /> : <PlusIcon />}
        </button>
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
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// Shown after wishlisted — a bold checkmark
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}