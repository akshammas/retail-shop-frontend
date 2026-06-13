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


// ── Authenticated requests ──────────────────────────
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("access_token")
  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
}


// ── Cart ────────────────────────────────────────────
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


// ── Categories ──────────────────────────────────────
export async function getCategories() {
  const res = await fetch(`${API_URL}/categories/`)
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}