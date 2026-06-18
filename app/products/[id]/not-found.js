// app/products/[id]/not-found.js

import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-xl text-gray-600 mt-4">Product not found</p>
      <p className="text-gray-400 text-sm mt-2">
        The product you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/products"
        className="mt-6 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700"
      >
        Browse Products
      </Link>
    </main>
  )
}