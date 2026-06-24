// app/cart/page.js

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authFetch } from "@/lib/api"
import { useAuth } from "@/components/AuthProvider"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function CartPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    fetchCart()
  }, [authLoading, isLoggedIn])

  async function fetchCart() {
    try {
      const res = await authFetch("/orders/cart")
      const data = await res.json()
      setCartItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(cartItemId, newQty) {
    if (newQty < 1) return
    setUpdatingId(cartItemId)
    try {
      const res = await authFetch(`/orders/cart/${cartItemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: newQty }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setCartItems(items =>
        items.map(i => (i.id === cartItemId ? updated : i))
      )
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  async function removeItem(cartItemId) {
    await authFetch(`/orders/cart/${cartItemId}`, { method: "DELETE" })
    setCartItems(items => items.filter(i => i.id !== cartItemId))
  }

  if (authLoading || loading) return <LoadingSpinner message="Loading cart..." />

  const subtotal = cartItems.reduce(
  (sum, item) => sum + item.product.discounted_price * item.quantity,
  0
  )
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99
  const total = subtotal + shipping

  return (
    <main className="px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-6">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => {
                const imageUrl = item.product.images?.length > 0
                  ? `http://localhost:8000${item.product.images[0].image_url}`
                  : null

                return (
                  <div
                      key={item.id}
                      className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4"
                    >
                      <Link
                        href={`/products/${item.product_id}`}
                        className="shrink-0 w-24 h-24 rounded-xl bg-gray-100 overflow-hidden"
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">

                        {/* Name / brand / remove */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.product_id}`}
                              className="font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2"
                            >
                              {item.product.name}
                            </Link>
                            {item.product.brand && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.product.brand}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 text-sm transition-colors shrink-0"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Quantity + price — stacked on mobile, inline on sm+ */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingId === item.id || item.quantity <= 1}
                              className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-medium disabled:opacity-40"
                            >
                              −
                            </button>
                            <span className="px-4 py-1.5 text-sm font-medium border-x border-gray-200 min-w-[2.5rem] text-center">
                              {updatingId === item.id ? "…" : item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingId === item.id || item.quantity >= item.product.quantity}
                              className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-medium disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          <p className="font-semibold text-gray-900">
                            ₹{(item.product.discounted_price * item.quantity).toLocaleString()}
                          </p>
                        </div>

                      </div>
                    </div>
                )
              })}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                {subtotal > 0 && subtotal < 999 && (
                  <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2 mt-4">
                    Add ₹{(999 - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}

                <Link
                  href="/checkout"
                  className="block text-center bg-yellow-500 text-gray-900 py-3.5 rounded-full font-semibold hover:bg-yellow-400 transition-colors mt-6"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}