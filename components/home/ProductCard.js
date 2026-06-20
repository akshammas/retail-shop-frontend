// components/home/ProductCard.js

"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authFetch } from "@/lib/api"

export default function ProductCard({ product }) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)

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

        <button
          onClick={handleQuickAdd}
          disabled={adding || !product.in_stock}
          aria-label="Add to cart"
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-yellow-500 text-gray-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 active:scale-90"
        >
          {adding ? (
            <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <PlusIcon />
          )}
        </button>
      </div>

      <h3 className="font-medium text-gray-900 truncate group-hover:text-gray-600 transition-colors">
        {product.name}
      </h3>
      <p className="text-gray-900 font-semibold mt-1">
        ₹{product.price.toLocaleString()}
      </p>
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