// app/admin/orders/[id]/page.js

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getAdminOrder, updateOrderStatus } from "@/lib/api"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    getAdminOrder(id)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(newStatus) {
    if (newStatus === order.status) return
    try {
      setUpdating(true)
      await updateOrderStatus(order.id, newStatus)
      setOrder(prev => ({ ...prev, status: newStatus }))
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading order..." />
  if (error) return <ErrorMessage message={error} />
  if (!order) return null

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block">
        ← Back to orders
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
        <span className={`text-sm font-medium px-3 py-1 rounded-full capitalize ${
          STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
        }`}>
          {order.status}
        </span>
      </div>

      {/* Status updater */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Update Status</h2>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={updating || s === order.status}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors disabled:cursor-not-allowed ${
                s === order.status
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Customer */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Customer</h2>
        <p className="text-sm text-gray-700">{order.user?.name}</p>
        <p className="text-sm text-gray-400">{order.user?.email}</p>
      </section>

      {/* Items */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map(item => {
            const imageUrl = item.product.images?.length > 0
              ? `http://localhost:8000${item.product.images[0].image_url}`
              : null
            return (
              <div key={item.id} className="flex gap-4 items-center border-t border-gray-50 pt-3 first:border-0 first:pt-0">
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">—</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-xs text-gray-400">
                    Qty: {item.quantity} · ₹{item.price_at_purchase.toLocaleString()} each
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Address + total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Shipping Address</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{order.shipping_address}</p>
        </section>
        <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:text-right">
          <h2 className="font-semibold text-gray-900 mb-2">Total</h2>
          <p className="text-2xl font-bold text-gray-900">
            ₹{order.total_amount.toLocaleString()}
          </p>
        </section>
      </div>
    </div>
  )
}