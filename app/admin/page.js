// app/admin/page.js

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getDashboard } from "@/lib/api"
import LoadingSpinner from "@/components/LoadingSpinner"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const STATUS_BAR_COLORS = {
  pending: "bg-yellow-400",
  confirmed: "bg-blue-400",
  shipped: "bg-purple-400",
  delivered: "bg-green-400",
  cancelled: "bg-red-400",
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-5">
        Failed to load dashboard: {error}
      </div>
    )
  }

  if (!data) return null

  const trendUp = data.revenue_percent_change !== null && data.revenue_percent_change >= 0
  const statusTotal = Object.values(data.order_status_counts).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-7xl">

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Here's what's happening with your store
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={`₹${data.total_revenue.toLocaleString()}`}
          accent
          sublabel={
            data.revenue_percent_change !== null ? (
              <span className={trendUp ? "text-green-400" : "text-red-400"}>
                {trendUp ? "↑" : "↓"} {Math.abs(data.revenue_percent_change)}% vs last week
              </span>
            ) : (
              <span className="text-gray-400">No prior data yet</span>
            )
          }
        />
        <StatCard label="Total Orders" value={data.total_orders.toLocaleString()} />
        <StatCard label="Avg. Order Value" value={`₹${data.average_order_value.toLocaleString()}`} />
        <StatCard label="New Customers" value={data.new_users_this_week} sublabel="this week" />
      </div>

      {/* Revenue + status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">Revenue Trend</h2>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Excludes cancelled orders</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenue_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", fontSize: 13 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#eab308" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(data.order_status_counts).map(([status, count]) => {
              const pct = statusTotal > 0 ? (count / statusTotal) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 capitalize">{status}</span>
                    <span className="text-xs font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLORS[status] || "bg-gray-300"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top sellers + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Selling Products</h2>
          {data.top_selling_products.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No sales data yet</p>
          ) : (
            <div className="space-y-1">
              {data.top_selling_products.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 truncate flex-1">{p.name}</span>
                  <span className="text-xs font-medium text-yellow-700 shrink-0">
                    {p.units_sold} sold
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Low Stock Alerts</h2>
            {data.out_of_stock_count > 0 && (
              <span className="text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                {data.out_of_stock_count} out of stock
              </span>
            )}
          </div>
          {data.low_stock_products.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No products running low — all good
            </p>
          ) : (
            <div className="space-y-1">
              {data.low_stock_products.map(p => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-700 truncate">{p.name}</span>
                  <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full shrink-0 ml-2">
                    {p.quantity} left
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-yellow-700 hover:text-yellow-800">
            View all →
          </Link>
        </div>

        {data.recent_orders.length === 0 ? (
          <p className="text-sm text-gray-400 py-12 text-center">No orders yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-2.5 font-medium">Order</th>
                <th className="px-6 py-2.5 font-medium">Customer</th>
                <th className="px-6 py-2.5 font-medium">Date</th>
                <th className="px-6 py-2.5 font-medium">Status</th>
                <th className="px-6 py-2.5 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.map(order => (
                <tr
                  key={order.id}
                  className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.assign(`/admin/orders/${order.id}`)}
                >
                  <td className="px-6 py-3 font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-3 text-gray-700">{order.user?.name || "—"}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {order.created_at && new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">
                    ₹{order.total_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent, sublabel }) {
  return (
    <div className={`rounded-2xl p-5 border ${
      accent ? "bg-gray-900 border-gray-900" : "bg-white border-gray-100"
    }`}>
      <p className={`text-xs ${accent ? "text-gray-300" : "text-gray-400"}`}>{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
      {sublabel && (
        <p className={`text-xs mt-1.5 ${accent ? "" : "text-gray-400"}`}>{sublabel}</p>
      )}
    </div>
  )
}