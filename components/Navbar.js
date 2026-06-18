// components/Navbar.js

"use client"

import Link from "next/link"
import { useAuth } from "./AuthProvider"

export default function Navbar() {
  const { user, isLoggedIn, logout, loading } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        <Link href="/" className="text-xl font-bold text-yellow-600">
          RetailShop
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-yellow-600 text-sm">
            Products
          </Link>
          <Link href="/cart" className="text-gray-600 hover:text-yellow-600 text-sm">
            Cart
          </Link>

          {loading ? (
            // show nothing while checking login state — avoids flicker
            <div className="w-20 h-8" />
          ) : isLoggedIn ? (
            // logged in — show user menu
            <div className="flex items-center gap-4">
              <Link href="/orders" className="text-gray-600 hover:text-yellow-600 text-sm">
                Orders
              </Link>
              <span className="text-sm text-gray-700 font-medium">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            // logged out — show login button
            <Link
              href="/login"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}