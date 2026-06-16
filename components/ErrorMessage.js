// components/ErrorMessage.js

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
        <p className="text-red-600 font-medium">Something went wrong</p>
        <p className="text-gray-500 text-sm mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}