// app/products/[id]/page.js
// Server Component — fetches the product

import { getProduct } from "@/lib/api"
import ProductDetailClient from "@/components/ProductDetailClient"
import { notFound } from "next/navigation"

export default async function ProductDetailPage({ params }) {
  const { id } = await params
  // ↑ in newer Next.js, params is a Promise — must await it

  let product
  try {
    product = await getProduct(id)
  } catch (err) {
    notFound()
    // ↑ shows Next.js's built-in 404 page if product doesn't exist
  }

  return <ProductDetailClient product={product} />
}