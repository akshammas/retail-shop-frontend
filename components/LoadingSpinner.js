// components/LoadingSpinner.js

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      {/* Spinning circle */}
      <div className="w-12 h-12 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin" />
      <p className="text-gray-500">{message}</p>
    </div>
  )
}