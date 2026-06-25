// components/Navbar.js

"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "./AuthProvider"

export default function Navbar() {
  const { user, isLoggedIn, logout, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  // close the profile dropdown when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    setProfileOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex items-center justify-between">

        <Link href="/" className="text-xl font-bold text-gray-900">
          RetailShop
        </Link>

        {/* Desktop nav — hidden below md */}

        <div className="hidden md:flex items-center gap-5">
          <Link href="/products" className="text-gray-600 hover:text-yellow-700 text-sm">
            Products
          </Link>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="text-gray-600 hover:text-yellow-700 w-9 h-9 flex items-center justify-center"
          >
            <HeartIcon />
          </Link>

          {/* Profile icon + dropdown — now comes BEFORE cart */}
          {loading ? (
            <div className="w-9 h-9" />
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                aria-label="Account"
                aria-expanded={profileOpen}
                className="text-gray-600 hover:text-yellow-700 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
              >
                <ProfileIcon />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cart — now last, rightmost */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="text-gray-600 hover:text-yellow-700 w-9 h-9 flex items-center justify-center"
          >
            <CartIcon />
          </Link>
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
            <MobileLink href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</MobileLink>
            {isLoggedIn && (
              <MobileLink href="/orders" onClick={() => setMenuOpen(false)}>Orders</MobileLink>
            )}
            <MobileLink href="/cart" onClick={() => setMenuOpen(false)}>Cart</MobileLink>
            {isLoggedIn ? (
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="text-left py-3 text-red-500 text-sm border-t border-gray-100 mt-2"
              >
                Logout
              </button>
            ) : (
              <MobileLink href="/login" onClick={() => setMenuOpen(false)}>Sign In</MobileLink>
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

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}