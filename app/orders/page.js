// app/orders/page.js

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getMyOrders } from "@/lib/api"
import { useAuth } from "@/components/AuthProvider"
import LoadingSpinner from "@/components/LoadingSpinner"

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    getMyOrders()
      .then(data => setOrders(data.slice().reverse()))
      // ↑ reverse so the most recently placed order shows first;
      //   the backend returns them in creation order, oldest first
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [authLoading, isLoggedIn])

  if (authLoading || loading) return <LoadingSpinner message="Loading orders..." />

  return (
    <main className="px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-6">No orders yet</p>
            <Link
              href="/products"
              className="inline-block bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const firstItem = order.items[0]
              const imageUrl = firstItem?.product.images?.length > 0
                ? `http://localhost:8000${firstItem.product.images[0].image_url}`
                : null
              const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block border border-gray-100 rounded-2xl p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-gray-900">
                          Order #{order.id}
                        </p>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                          STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                        {order.created_at && (
                          <> · {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}</>
                        )}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}