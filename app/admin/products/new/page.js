// app/admin/products/new/page.js

import { getCategories } from "@/lib/api"
import ProductForm from "@/components/admin/ProductForm"

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}