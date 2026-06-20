// components/home/NewsletterForm.js

"use client"

import { useState } from "react"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p className="text-yellow-400 font-medium">
        Thanks — you're on the list!
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full md:w-auto gap-3"
    >
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 md:w-72 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      <button
        type="submit"
        className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-400 transition-colors whitespace-nowrap"
      >
        Join
      </button>
    </form>
  )
}