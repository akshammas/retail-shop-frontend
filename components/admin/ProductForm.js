// components/admin/ProductForm.js

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProduct, updateProduct, uploadProductImage, deleteProductImage } from "@/lib/api"

export default function ProductForm({ initialProduct, categories }) {
  const router = useRouter()
  const isEdit = !!initialProduct

  const [form, setForm] = useState({
    name: initialProduct?.name || "",
    price: initialProduct?.price || "",
    description: initialProduct?.description || "",
    quantity: initialProduct?.quantity ?? 0,
    in_stock: initialProduct?.in_stock ?? true,
    category_id: initialProduct?.category_id || "",
    brand: initialProduct?.brand || "",
    available_sizes: initialProduct?.available_sizes || "",
    discount_percent: initialProduct?.discount_percent || "",
    discount_starts_at: initialProduct?.discount_starts_at?.slice(0, 16) || "",
    discount_ends_at: initialProduct?.discount_ends_at?.slice(0, 16) || "",
  })

  const [images, setImages] = useState(initialProduct?.images || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description || null,
      quantity: Number(form.quantity),
      in_stock: form.in_stock,
      category_id: form.category_id ? Number(form.category_id) : null,
      brand: form.brand || null,
      available_sizes: form.available_sizes || null,
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      discount_starts_at: form.discount_starts_at || null,
      discount_ends_at: form.discount_ends_at || null,
    }

    try {
      setSaving(true)
      if (isEdit) {
        await updateProduct(initialProduct.id, payload)
        router.push("/admin/products")
      } else {
        const created = await createProduct(payload)
        // redirect straight to its edit page so images can be added immediately
        router.push(`/admin/products/${created.id}/edit`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file || !initialProduct) return

    try {
      setUploadingImage(true)
      const newImage = await uploadProductImage(initialProduct.id, file, images.length === 0)
      setImages(prev => [...prev, newImage])
    } catch (err) {
      setError("Failed to upload image")
    } finally {
      setUploadingImage(false)
      e.target.value = ""
    }
  }

  async function handleImageDelete(imageId) {
    try {
      await deleteProductImage(initialProduct.id, imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch (err) {
      setError("Failed to delete image")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Basic info */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>

        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={e => update("name", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={e => update("description", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)">
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={form.price}
              onChange={e => update("price", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </Field>
          <Field label="Brand">
            <input
              value={form.brand}
              onChange={e => update("brand", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantity">
            <input
              required
              type="number"
              min="0"
              value={form.quantity}
              onChange={e => update("quantity", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category_id}
              onChange={e => update("category_id", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Available Sizes (comma separated, optional)">
          <input
            placeholder="S, M, L, XL"
            value={form.available_sizes}
            onChange={e => update("available_sizes", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.in_stock}
            onChange={e => update("in_stock", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
          />
          In stock
        </label>
      </section>

      {/* Discount */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Discount (optional)</h2>
        <Field label="Discount %">
          <input
            type="number"
            min="1"
            max="90"
            value={form.discount_percent}
            onChange={e => update("discount_percent", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Starts">
            <input
              type="datetime-local"
              value={form.discount_starts_at}
              onChange={e => update("discount_starts_at", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </Field>
          <Field label="Ends">
            <input
              type="datetime-local"
              value={form.discount_ends_at}
              onChange={e => update("discount_ends_at", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </Field>
        </div>
      </section>

      {/* Images — only available once the product exists */}
      <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Images</h2>

        {!isEdit ? (
          <p className="text-sm text-gray-400">
            Save the product first, then you can upload images.
          </p>
        ) : (
          <>
            <div className="flex gap-3 flex-wrap">
              {images.map(img => (
                <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 group">
                  <img
                    src={`http://localhost:8000${img.image_url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {img.is_primary && (
                    <span className="absolute bottom-0 left-0 right-0 bg-yellow-500 text-gray-900 text-[10px] text-center font-medium">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}

              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs cursor-pointer hover:border-gray-300">
                {uploadingImage ? "..." : "+ Add"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </>
        )}
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}