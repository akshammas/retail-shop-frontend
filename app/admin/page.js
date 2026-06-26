// app/admin/page.js

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAdminProducts, getMyOrders } from "@/lib/api"
import { authFetch } from "@/lib/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    authFetch("/admin/stats")
      .then(res => res.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <StatCard label="Total Products" value={stats?.total_products} />
        <StatCard label="Total Users" value={stats?.total_users} />
        <StatCard label="Total Orders" value={stats?.total_orders} />
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/products/new"
          className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          + Add Product
        </Link>
        <Link
          href="/admin/products"
          className="border border-gray-200 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Manage Products
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {value ?? "—"}
      </p>
    </div>
  )
}