// components/ProductDetailClient.js

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ProductDetailClient({ product }) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState(null)

  async function handleAddToCart() {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      setAddingToCart(true)
      const res = await fetch("http://localhost:8000/orders/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id, quantity })
      })
      if (!res.ok) throw new Error()
      setCartMessage("Added to cart!")
      setTimeout(() => setCartMessage(null), 3000)
    } catch {
      setCartMessage("Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      <nav className="text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a>
        <span className="mx-2">→</span>
        <a href="/products" className="hover:text-blue-600">Products</a>
        <span className="mx-2">→</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center overflow-hidden mb-4">
            {product.images?.length > 0 ? (
              <img
                src={`http://localhost:8000${product.images[selectedImage].image_url}`}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-gray-400">No image available</div>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-blue-600" : "border-transparent"
                  }`}
                >
                  <img
                    src={`http://localhost:8000${img.image_url}`}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <span className={`mt-2 inline-block w-fit text-sm px-3 py-1 rounded-full font-medium ${
            product.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {product.in_stock ? `In Stock (${product.quantity} left)` : "Out of Stock"}
          </span>

          <p className="text-4xl font-bold text-blue-600 mt-4">
            ₹{product.price.toLocaleString()}
          </p>

          {product.description && (
            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
          )}

          <hr className="my-6" />

          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-700 font-medium">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold"
              >
                −
              </button>
              <span className="px-4 py-2 border-x border-gray-300 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {cartMessage && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
              cartMessage.includes("Failed") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}>
              {cartMessage}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || addingToCart}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
              !product.in_stock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : addingToCart
                ? "bg-blue-400 text-white cursor-wait"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {!product.in_stock ? "Out of Stock" : addingToCart ? "Adding..." : "Add to Cart"}
          </button>

          <a href="/products" className="mt-4 text-center text-gray-500 hover:text-blue-600 text-sm">
            ← Back to Products
          </a>
        </div>
      </div>
    </main>
  )
}