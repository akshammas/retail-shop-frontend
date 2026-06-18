// app/products/page.js
// NO "use client"

import { getProducts, getCategories } from "@/lib/api"
import ProductsClient from "@/components/ProductsClient"

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams
  // ↑ in newer Next.js, searchParams is also a Promise — must await it
  // URL /products?category=2 → params = { category: "2" }

  const categoryParam = params.category ? Number(params.category) : null
  const searchParam = params.search || ""

  const [products, categories] = await Promise.all([
    getProducts({
      limit: 12,
      ...(categoryParam ? { category: categoryParam } : {}),
      ...(searchParam ? { search: searchParam } : {})
    }),
    getCategories()
  ])

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
      initialCategory={categoryParam}
      initialSearch={searchParam}
    />
  )
}