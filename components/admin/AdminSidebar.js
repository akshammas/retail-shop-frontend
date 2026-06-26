// components/admin/AdminSidebar.js

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-gray-100 min-h-screen p-5 hidden md:block">
      <p className="font-bold text-gray-900 mb-8">Admin Panel</p>
      <nav className="space-y-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-yellow-100 text-yellow-800"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <Link
        href="/"
        className="block mt-10 text-sm text-gray-400 hover:text-gray-700"
      >
        ← Back to store
      </Link>
    </aside>
  )
}