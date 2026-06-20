// app/products/page.js

import { getProducts, getProductsCount, getCategories } from "@/lib/api"
import ProductsClient from "@/components/ProductsClient"

const PAGE_SIZE = 12

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams

  const categoryParam = params.category ? Number(params.category) : null
  const searchParam = params.search || ""
  const pageParam = params.page ? Math.max(1, Number(params.page)) : 1

  const filterParams = {
    ...(categoryParam ? { category: categoryParam } : {}),
    ...(searchParam ? { search: searchParam } : {}),
  }

  const [products, { total }, categories] = await Promise.all([
    getProducts({
      limit: PAGE_SIZE,
      skip: (pageParam - 1) * PAGE_SIZE,
      ...filterParams,
    }),
    getProductsCount(filterParams),
    getCategories(),
  ])

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
      initialCategory={categoryParam}
      initialSearch={searchParam}
      initialPage={pageParam}
      initialTotal={total}
      pageSize={PAGE_SIZE}
    />
  )
}