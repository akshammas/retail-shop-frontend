// app/cart/page.js

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCart } from "@/lib/api"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }
    getCart()
      .then(setCartItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function removeItem(cartItemId) {
    const token = localStorage.getItem("access_token")
    await fetch(`http://localhost:8000/orders/cart/${cartItemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
    setCartItems(items => items.filter(i => i.id !== cartItemId))
    // ↑ remove from local state without refetching
  }

  if (loading) return <LoadingSpinner message="Loading cart..." />

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">Your cart is empty</p>
          <a
            href="/products"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">
                  Product ID: {item.product_id}
                </p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}

          
          <a  href="/checkout"
            className="block text-center bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 mt-6"
          >
            Proceed to Checkout
          </a>
        </div>
      )}
    </main>
  )
}