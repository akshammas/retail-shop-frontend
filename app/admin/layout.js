// app/admin/layout.js

import AdminGuard from "@/components/admin/AdminGuard"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}