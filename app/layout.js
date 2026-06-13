// app/layout.js

import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Retail Shop",
  description: "Your one-stop shop",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-blue-600">
              RetailShop
            </a>
            <div className="flex items-center gap-6">
              <a href="/products" className="text-gray-600 hover:text-blue-600 text-sm">
                Products
              </a>
              <a href="/cart" className="text-gray-600 hover:text-blue-600 text-sm">
                Cart
              </a>
              
              <a href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Login
              </a>
            </div>
          </div>
        </nav>

        {/* Page content */}
        {children}
      </body>
    </html>
  )
}