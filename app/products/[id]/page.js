// app/products/[id]/page.js

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getProduct } from "@/lib/api"
import LoadingSpinner from "@/components/LoadingSpinner"
import ErrorMessage from "@/components/ErrorMessage"

export default function ProductDetailPage() {
  const { id } = useParams()
  // ↑ reads the [id] from the URL
  // if URL is /products/42 → id = "42"

  const router = useRouter()
  // ↑ lets you navigate programmatically
  // router.push("/cart") → goes to cart page

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState(null)

  // fetch product when page loads
  useEffect(() => {
    if (!id) return
    getProduct(id)
      .then(data => {
        setProduct(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])
  // ↑ [id] in dependency array means:
  //   re-fetch if id changes (user navigates to different product)

  async function handleAddToCart() {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")  // redirect to login if not logged in
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
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      })

      if (!res.ok) throw new Error("Failed to add to cart")

      setCartMessage("Added to cart!")
      setTimeout(() => setCartMessage(null), 3000)
      // ↑ show success message for 3 seconds then hide it

    } catch (err) {
      setCartMessage("Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading product..." />
  if (error) return <ErrorMessage message={error} />
  if (!product) return null

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* Breadcrumb navigation */}
      <nav className="text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-blue-600">Home</a>
        <span className="mx-2">→</span>
        <a href="/products" className="hover:text-blue-600">Products</a>
        <span className="mx-2">→</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Left — Images */}
        <div>
          {/* Main image */}
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

          {/* Thumbnail images */}
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? "border-blue-600"
                      : "border-transparent"
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

        {/* Right — Product info */}
        <div className="flex flex-col">

          {/* Name */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Stock badge */}
          <span className={`mt-2 inline-block w-fit text-sm px-3 py-1 rounded-full font-medium ${
            product.in_stock
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {product.in_stock
              ? `In Stock (${product.quantity} left)`
              : "Out of Stock"
            }
          </span>

          {/* Price */}
          <p className="text-4xl font-bold text-blue-600 mt-4">
            ₹{product.price.toLocaleString()}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 mt-4 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Category */}
          {product.category_id && (
            <p className="text-sm text-gray-400 mt-2">
              Category ID: {product.category_id}
            </p>
          )}

          {/* Divider */}
          <hr className="my-6" />

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-700 font-medium">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold"
              >
                −
              </button>
              <span className="px-4 py-2 border-x border-gray-300 font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                className="px-3 py-2 hover:bg-gray-100 text-gray-600 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Cart success/error message */}
          {cartMessage && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
              cartMessage.includes("Failed")
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}>
              {cartMessage}
            </div>
          )}

          {/* Add to cart button */}
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
            {!product.in_stock
              ? "Out of Stock"
              : addingToCart
              ? "Adding..."
              : "Add to Cart"
            }
          </button>

          {/* Back link */}
          
           <a href="/products"
            className="mt-4 text-center text-gray-500 hover:text-blue-600 text-sm"
          >
            ← Back to Products
          </a>
        </div>
      </div>
    </main>
  )
}