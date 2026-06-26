// lib/api.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ── Products ────────────────────────────────────────
export async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${API_URL}/products/?${query}`)
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`)
  if (!res.ok) throw new Error("Product not found")
  return res.json()
}

export async function getFeaturedProducts() {
  const res = await fetch(`${API_URL}/products/featured`)
  if (!res.ok) throw new Error("Failed to fetch featured products")
  return res.json()
}

// ── Auth ────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error("Invalid credentials")
  return res.json()
}

export async function signup(name, email, password) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
  if (!res.ok) throw new Error("Signup failed")
  return res.json()
}

// ── Categories ──────────────────────────────────────
export async function getCategories() {
  const res = await fetch(`${API_URL}/categories/`)
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

// ── Authenticated requests with auto-refresh ────────
export async function authFetch(url, options = {}) {
  let token = localStorage.getItem("access_token")

  let res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })

  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token")
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (refreshRes.ok) {
        const newTokenData = await refreshRes.json()
        localStorage.setItem("access_token", newTokenData.access_token)

        res = await fetch(`${API_URL}${url}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newTokenData.access_token}`,
            ...options.headers
          }
        })
      } else {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }
  }

  return res
}

// ── Cart (using authFetch) ──────────────────────────
export async function getCart() {
  const res = await authFetch("/orders/cart")
  if (!res.ok) throw new Error("Failed to fetch cart")
  return res.json()
}

export async function addToCart(product_id, quantity = 1) {
  const res = await authFetch("/orders/cart", {
    method: "POST",
    body: JSON.stringify({ product_id, quantity })
  })
  if (!res.ok) throw new Error("Failed to add to cart")
  return res.json()
}

export async function getProductsCount(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await fetch(`${API_URL}/products/count?${query}`)
  if (!res.ok) throw new Error("Failed to fetch product count")
  return res.json()
}

export async function getRelatedProducts(id) {
  const res = await fetch(`${API_URL}/products/${id}/related`)
  if (!res.ok) throw new Error("Failed to fetch related products")
  return res.json()
}

// lib/api.js

export async function getAddresses() {
  const res = await authFetch("/addresses/")
  if (!res.ok) throw new Error("Failed to fetch addresses")
  return res.json()
}

export async function addAddress(address) {
  const res = await authFetch("/addresses/", {
    method: "POST",
    body: JSON.stringify(address),
  })
  if (!res.ok) throw new Error("Failed to add address")
  return res.json()
}

export async function checkout(shippingAddress) {
  const res = await authFetch("/orders/checkout", {
    method: "POST",
    body: JSON.stringify({ shipping_address: shippingAddress }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Checkout failed")
  }
  return res.json()
}

export async function buyNowCheckout(shippingAddress, items) {
  const res = await authFetch("/orders/buy-now", {
    method: "POST",
    body: JSON.stringify({ shipping_address: shippingAddress, items }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Checkout failed")
  }
  return res.json()
}


export async function getMyOrders() {
  const res = await authFetch("/orders/my-orders")
  if (!res.ok) throw new Error("Failed to fetch orders")
  return res.json()
}

export async function getOrder(id) {
  const res = await authFetch(`/orders/${id}`)
  if (!res.ok) throw new Error("Order not found")
  return res.json()
}


export async function getWishlist() {
  const res = await authFetch("/wishlist/")
  if (!res.ok) throw new Error("Failed to fetch wishlist")
  return res.json()
}

export async function getWishlistIds() {
  const res = await authFetch("/wishlist/ids")
  if (!res.ok) throw new Error("Failed to fetch wishlist")
  return res.json()
}

export async function addToWishlist(productId) {
  const res = await authFetch("/wishlist/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  })
  if (!res.ok) throw new Error("Failed to add to wishlist")
  return res.json()
}

export async function removeFromWishlist(productId) {
  const res = await authFetch(`/wishlist/${productId}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to remove from wishlist")
  return res.json()
}


// lib/api.js

export async function getAdminProducts() {
  const res = await authFetch("/products/admin/all")
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export async function createProduct(data) {
  const res = await authFetch("/products/", {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to create product")
  }
  return res.json()
}

export async function updateProduct(id, data) {
  const res = await authFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to update product")
  }
  return res.json()
}

export async function deleteProduct(id) {
  const res = await authFetch(`/products/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete product")
  return res.json()
}

export async function uploadProductImage(productId, file, isPrimary = false) {
  const token = localStorage.getItem("access_token")
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/images?is_primary=${isPrimary}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      // NOTE: no Content-Type header here — the browser sets the correct
      // multipart boundary automatically when the body is a FormData object.
      // Setting Content-Type manually for file uploads is a common bug.
      body: formData,
    }
  )
  if (!res.ok) throw new Error("Failed to upload image")
  return res.json()
}

export async function deleteProductImage(productId, imageId) {
  const res = await authFetch(`/products/${productId}/images/${imageId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete image")
  return res.json()
}