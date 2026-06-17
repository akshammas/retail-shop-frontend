// app/products/page.js
// NO "use client" — this is a Server Component

import { getProducts, getCategories } from "@/lib/api"
import ProductsClient from "@/components/ProductsClient"

// this is an async function — only possible in Server Components!
export default async function ProductsPage() {

  // fetch happens on the SERVER, before page is sent to browser
  const [products, categories] = await Promise.all([
    getProducts({ limit: 12 }),
    getCategories()
  ])
  // ↑ Promise.all runs both fetches at the same time (faster than one by one)

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
    />
  )
}