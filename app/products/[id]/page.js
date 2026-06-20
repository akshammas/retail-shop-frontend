// app/products/[id]/page.js

import { getProduct, getRelatedProducts } from "@/lib/api"
import ProductDetailClient from "@/components/ProductDetailClient"
import { notFound } from "next/navigation"

export default async function ProductDetailPage({ params }) {
  const { id } = await params

  let product
  try {
    product = await getProduct(id)
  } catch {
    notFound()
  }

  const related = await getRelatedProducts(id).catch(() => [])

  return <ProductDetailClient product={product} related={related} />
}