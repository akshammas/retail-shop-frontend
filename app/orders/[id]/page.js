// app/orders/[id]/page.js

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getOrder } from "@/lib/api"
import { useAuth } from "@/components/AuthProvider"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"]

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    getOrder(id)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [authLoading, isLoggedIn, id])

  if (authLoading || loading) return <LoadingSpinner message="Loading order..." />
  if (error) return <ErrorMessage message={error} />
  if (!order) return null

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <main className="px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-3xl mx-auto">

        <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block">
          ← Back to orders
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Order #{order.id}
          </h1>
          <span className={`text-sm font-medium px-3 py-1 rounded-full capitalize ${
            STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
          }`}>
            {order.status}
          </span>
        </div>

        {order.created_at && (
          <p className="text-sm text-gray-500 mb-8">
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        )}

        {/* Status progress bar — skipped entirely if cancelled */}
        {!isCancelled && (
          <div className="flex items-center mb-10">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStepIndex
                      ? "bg-yellow-500 text-gray-900"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 capitalize ${
                    i <= currentStepIndex ? "text-gray-900 font-medium" : "text-gray-400"
                  }`}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    i < currentStepIndex ? "bg-yellow-500" : "bg-gray-100"
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-10 text-sm text-red-700">
            This order was cancelled.
          </div>
        )}

        {/* Items */}
        <section className="mb-10">
          <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map(item => {
              const imageUrl = item.product.images?.length > 0
                ? `http://localhost:8000${item.product.images[0].image_url}`
                : null
              return (
                <div key={item.id} className="flex gap-4 items-center border border-gray-100 rounded-xl p-3">
                  <Link
                    href={`/products/${item.product_id}`}
                    className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0"
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-medium text-gray-900 text-sm hover:text-gray-600"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Qty: {item.quantity} · ₹{item.price_at_purchase.toLocaleString()} each
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Shipping + total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Shipping Address</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {order.shipping_address}
            </p>
          </section>

          <section className="sm:text-right">
            <h2 className="font-semibold text-gray-900 mb-2">Order Total</h2>
            <p className="text-2xl font-bold text-gray-900">
              ₹{order.total_amount.toLocaleString()}
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}