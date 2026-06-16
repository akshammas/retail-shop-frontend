// app/layout.js

import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Retail Shop",
  description: "Your one-stop shop",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-blue-600">
              RetailShop
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/products" className="text-gray-600 hover:text-blue-600 text-sm">
                Products
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-blue-600 text-sm">
                Cart
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}