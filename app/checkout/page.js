// app/checkout/page.js

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  authFetch, getAddresses, addAddress, checkout, buyNowCheckout, getProduct,
} from "@/lib/api"
import { useAuth } from "@/components/AuthProvider"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, loading: authLoading } = useAuth()

  const isBuyNow = searchParams.get("buyNow") === "true"
  const buyNowProductId = searchParams.get("productId")
  const buyNowQty = Number(searchParams.get("qty") || 1)

  // ── line items shown on screen ──────────────────
  // buy-now mode starts with just the one product; cart items can be added on top
  const [buyNowItem, setBuyNowItem] = useState(null)      // { product, quantity }
  const [extraCartItems, setExtraCartItems] = useState([]) // cart rows the user chose to add in
  const [availableCartItems, setAvailableCartItems] = useState([]) // full cart, for the "add from cart" picker
  const [showCartPicker, setShowCartPicker] = useState(false)

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)

  const [form, setForm] = useState({
    full_name: "", phone: "", street: "", city: "", state: "", pincode: "",
  })
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    loadCheckoutData()
  }, [authLoading, isLoggedIn])

  async function loadCheckoutData() {
    try {
      const addressList = await getAddresses()
      setAddresses(addressList)
      const defaultAddr = addressList.find(a => a.is_default) || addressList[0]
      if (defaultAddr) setSelectedAddressId(defaultAddr.id)
      if (addressList.length === 0) setShowNewAddressForm(true)

      if (isBuyNow && buyNowProductId) {
        // Buy Now mode — fetch just the one product, ignore the cart entirely for now
        const product = await getProduct(buyNowProductId)
        setBuyNowItem({ product, quantity: buyNowQty })

        // still fetch the cart in the background, in case they want to add from it
        const cartRes = await authFetch("/orders/cart")
        const cart = await cartRes.json()
        setAvailableCartItems(cart)
      } else {
        // normal cart-checkout mode — unchanged from before
        const cartRes = await authFetch("/orders/cart")
        const cart = await cartRes.json()
        setExtraCartItems(cart)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function addCartItemToOrder(cartItem) {
    setExtraCartItems(prev => [...prev, cartItem])
    setAvailableCartItems(prev => prev.filter(i => i.id !== cartItem.id))
  }

  function removeExtraCartItem(cartItemId) {
    const removed = extraCartItems.find(i => i.id === cartItemId)
    setExtraCartItems(prev => prev.filter(i => i.id !== cartItemId))
    if (removed) setAvailableCartItems(prev => [...prev, removed])
  }

  async function handleSaveAddress(e) {
    e.preventDefault()
    try {
      setSavingAddress(true)
      const newAddr = await addAddress({ ...form, is_default: addresses.length === 0 })
      setAddresses(prev => [...prev, newAddr])
      setSelectedAddressId(newAddr.id)
      setShowNewAddressForm(false)
      setForm({ full_name: "", phone: "", street: "", city: "", state: "", pincode: "" })
    } catch {
      setError("Failed to save address")
    } finally {
      setSavingAddress(false)
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setError("Please select or add a shipping address")
      return
    }

    const addr = addresses.find(a => a.id === selectedAddressId)
    const formattedAddress = `${addr.full_name}, ${addr.street}, ${addr.city}, ${addr.state} ${addr.pincode}, Phone: ${addr.phone}`

    try {
      setPlacing(true)
      setError(null)

      if (isBuyNow) {
        // build the explicit item list: the Buy Now product + anything added from cart
        const items = [
          { product_id: buyNowItem.product.id, quantity: buyNowItem.quantity },
          ...extraCartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        ]
        const order = await buyNowCheckout(formattedAddress, items)
        router.push(`/orders/${order.id}`)
      } else {
        const order = await checkout(formattedAddress)
        router.push(`/orders/${order.id}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  if (authLoading || loading) return <LoadingSpinner message="Loading checkout..." />

  // combined list of what's actually being charged, for display + totals
  const displayItems = isBuyNow
    ? [{ id: "buy-now", product: buyNowItem.product, quantity: buyNowItem.quantity }, ...extraCartItems]
    : extraCartItems

  if (displayItems.length === 0) {
    return (
      <main className="px-6 md:px-12 lg:px-20 py-24 text-center">
        <p className="text-gray-400 text-lg mb-6">Nothing to check out</p>
        <Link
          href="/products"
          className="inline-block bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          Browse Products
        </Link>
      </main>
    )
  }

  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.product.discounted_price * item.quantity,
    0
  )
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + shipping

  return (
    <main className="px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Checkout
        </h1>
        {isBuyNow && (
          <p className="text-sm text-gray-500 mb-10">
            Buying this item directly — your other cart items are untouched.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left: address + items ──────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Shipping address — unchanged from before */}
            <section>
              <h2 className="font-semibold text-gray-900 mb-4 text-lg">
                Shipping Address
              </h2>

              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`block border rounded-xl p-4 cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {addr.full_name}
                            {addr.is_default && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 mt-1">
                            {addr.street}, {addr.city}, {addr.state} {addr.pincode}
                          </p>
                          <p className="text-gray-500">{addr.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!showNewAddressForm ? (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                >
                  + Add a new address
                </button>
              ) : (
                <form onSubmit={handleSaveAddress} className="border border-gray-200 rounded-xl p-5 space-y-3 mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Full name" value={form.full_name}
                      onChange={e => setForm({ ...form, full_name: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    <input required placeholder="Phone" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    <input required placeholder="Street address" value={form.street}
                      onChange={e => setForm({ ...form, street: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    <input required placeholder="City" value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    <input required placeholder="State" value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    <input required placeholder="Pincode" value={form.pincode}
                      onChange={e => setForm({ ...form, pincode: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={savingAddress}
                      className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
                      {savingAddress ? "Saving..." : "Save Address"}
                    </button>
                    {addresses.length > 0 && (
                      <button type="button" onClick={() => setShowNewAddressForm(false)}
                        className="text-sm text-gray-500 hover:text-gray-900">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </section>

            {/* Order items */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-lg">
                  Order Items ({displayItems.length})
                </h2>
                {isBuyNow && availableCartItems.length > 0 && (
                  <button
                    onClick={() => setShowCartPicker(s => !s)}
                    className="text-sm font-medium text-yellow-700 hover:text-yellow-800"
                  >
                    {showCartPicker ? "Hide cart" : "+ Add from cart"}
                  </button>
                )}
              </div>

              {/* Cart picker — only in Buy Now mode, only shown on demand */}
              {isBuyNow && showCartPicker && (
                <div className="border border-dashed border-gray-300 rounded-xl p-4 mb-4 space-y-2">
                  <p className="text-xs text-gray-400 mb-2">
                    Items currently in your cart — add any of these to this order:
                  </p>
                  {availableCartItems.length === 0 ? (
                    <p className="text-sm text-gray-400">Nothing else in your cart.</p>
                  ) : (
                    availableCartItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-700">
                          {item.product.name} × {item.quantity}
                        </span>
                        <button
                          onClick={() => addCartItemToOrder(item)}
                          className="text-yellow-700 hover:text-yellow-800 font-medium"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="space-y-3">
                {displayItems.map(item => {
                  const imageUrl = item.product.images?.length > 0
                    ? `http://localhost:8000${item.product.images[0].image_url}`
                    : null
                  const isBuyNowLine = item.id === "buy-now"
                  return (
                    <div key={item.id} className="flex gap-4 items-center border border-gray-100 rounded-xl p-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {item.product.name}
                          {isBuyNowLine && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              Buy Now
                            </span>
                          )}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        ₹{(item.product.discounted_price * item.quantity).toLocaleString()}
                      </p>
                      {!isBuyNowLine && isBuyNow && (
                        <button
                          onClick={() => removeExtraCartItem(item.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* ── Right: order summary ──────────── */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-4">
                  {error}
                </p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddressId}
                className="w-full bg-yellow-500 text-gray-900 py-3.5 rounded-full font-semibold hover:bg-yellow-400 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? "Placing order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}