// app/admin/products/[id]/edit/page.js

import { getProduct, getCategories } from "@/lib/api"
import ProductForm from "@/components/admin/ProductForm"
import { notFound } from "next/navigation"

export default async function EditProductPage({ params }) {
  const { id } = await params

  let product
  try {
    product = await getProduct(id)
  } catch {
    notFound()
  }

  const categories = await getCategories()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Product</h1>
      <ProductForm initialProduct={product} categories={categories} />
    </div>
  )
}