// app/page.js

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Retail Shop
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Your one-stop shop for everything
        </p>
        
        <a href="/products"
          className="mt-8 inline-block bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700">
          Browse Products
        </a>
      </div>
    </main>
  )
}