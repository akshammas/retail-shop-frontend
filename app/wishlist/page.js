// app/wishlist/page.js

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getWishlist, removeFromWishlist } from "@/lib/api"
import { useAuth } from "@/components/AuthProvider"
import { useWishlist } from "@/components/WishlistProvider"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function WishlistPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const { wishlistIds } = useWishlist()  // used to re-trigger refetch if it changes elsewhere
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    getWishlist()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [authLoading, isLoggedIn, wishlistIds.length])
  // ↑ refetch the full list whenever the count changes (e.g. removed via a heart
  //   click on a different page, then user navigates here)

  async function handleRemove(productId) {
    setItems(prev => prev.filter(item => item.product_id !== productId))
    try {
      await removeFromWishlist(productId)
    } catch (err) {
      console.error(err)
    }
  }

  if (authLoading || loading) return <LoadingSpinner message="Loading wishlist..." />

  return (
    <main className="px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
          Your Wishlist
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-6">Your wishlist is empty</p>
            <Link
              href="/products"
              className="inline-block bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {items.map(item => {
              const product = item.product
              const imageUrl = product.images?.length > 0
                ? `http://localhost:8000${product.images[0].image_url}`
                : null

              return (
                <div key={item.id} className="group">
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
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
                      {product.is_on_sale && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          {product.discount_percent}% OFF
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    {product.is_on_sale ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-semibold">
                          ₹{product.discounted_price.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm line-through">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-900 font-semibold">
                        ₹{product.price.toLocaleString()}
                      </p>
                    )}
                  </Link>
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="mt-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}