// components/Navbar.js

"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "./AuthProvider"

export default function Navbar() {
  const { user, isLoggedIn, logout, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex items-center justify-between">

        <Link href="/" className="text-xl font-bold text-gray-900">
          RetailShop
        </Link>

        {/* Desktop links — hidden below md */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-yellow-700 text-sm">
            Products
          </Link>
          <Link href="/cart" className="text-gray-600 hover:text-yellow-700 text-sm">
            Cart
          </Link>

          {loading ? (
            <div className="w-20 h-8" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/wishlist" className="text-gray-600 hover:text-yellow-700 text-sm">
                Wishlist
              </Link>
              <Link href="/orders" className="text-gray-600 hover:text-yellow-700 text-sm">
                Orders
              </Link>
              <span className="text-sm text-gray-700 font-medium">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile hamburger — shown below md only */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Mobile slide-in drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl p-6 flex flex-col gap-1 md:hidden">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-900">Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="w-8 h-8 flex items-center justify-center">
                <CloseIcon />
              </button>
            </div>

            {isLoggedIn && (
              <p className="text-sm text-gray-500 mb-3">
                Hi, {user.name.split(" ")[0]}
              </p>
            )}

            <MobileLink href="/products" onClick={() => setMenuOpen(false)}>Products</MobileLink>
            <MobileLink href="/cart" onClick={() => setMenuOpen(false)}>Cart</MobileLink>

            {isLoggedIn ? (
              <>
                <MobileLink href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</MobileLink>
                <MobileLink href="/orders" onClick={() => setMenuOpen(false)}>Orders</MobileLink>
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="text-left py-3 text-red-500 text-sm border-t border-gray-100 mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <MobileLink href="/login" onClick={() => setMenuOpen(false)}>Login</MobileLink>
            )}
          </div>
        </>
      )}
    </nav>
  )
}

function MobileLink({ href, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="py-3 text-gray-700 text-sm border-b border-gray-50 hover:text-yellow-700"
    >
      {children}
    </Link>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}