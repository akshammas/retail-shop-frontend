// app/admin/orders/page.js

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAdminOrders } from "@/lib/api"
import LoadingSpinner from "@/components/LoadingSpinner"

const STATUS_OPTIONS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"]

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  async function loadOrders() {
    try {
      setLoading(true)
      const data = await getAdminOrders(statusFilter === "all" ? null : statusFilter)
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading orders..." />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)
                return (
                  <tr key={order.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-5 py-3 text-gray-700">
                      <p>{order.user?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{itemCount}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      ₹{order.total_amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {order.created_at && new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-yellow-700 hover:text-yellow-800 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {orders.length === 0 && (
            <p className="text-center text-gray-400 py-12">No orders found</p>
          )}
        </div>
      )}
    </div>
  )
}