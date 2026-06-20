// components/home/CategoryGrid.js

"use client"

import Link from "next/link"
import { useRef, useState, useEffect, useCallback } from "react"

const AUTO_SCROLL_INTERVAL = 3000

export default function CategoryGrid({ categories }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  function updateScrollButtons() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  const scroll = useCallback((direction) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.firstChild?.offsetWidth || 280
    const gap = 24

    if (direction === "right" && el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" })
      return
    }

    el.scrollBy({
      left: direction === "right" ? cardWidth + gap : -(cardWidth + gap),
      behavior: "smooth",
    })
  }, [])

  useEffect(() => {
    updateScrollButtons()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateScrollButtons)
    window.addEventListener("resize", updateScrollButtons)
    return () => {
      el.removeEventListener("scroll", updateScrollButtons)
      window.removeEventListener("resize", updateScrollButtons)
    }
  }, [categories])

  useEffect(() => {
    if (isPaused || !categories || categories.length <= 4) return
    const timer = setInterval(() => scroll("right"), AUTO_SCROLL_INTERVAL)
    return () => clearInterval(timer)
  }, [isPaused, categories, scroll])

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ChevronRight />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className="group relative shrink-0 snap-start rounded-2xl overflow-hidden bg-gray-100
                       w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] md:w-[calc(25%-18px)]
                       aspect-square"
          >
            {cat.imageUrl ? (
              <>
                <img
                  src={`http://localhost:8000${cat.imageUrl}`}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute bottom-5 left-5 text-white font-semibold text-lg capitalize">
                  {cat.name}
                </span>
              </>
            ) : (
              // fallback when no product image exists for this category yet
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-yellow-700 font-bold text-xl">
                    {cat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-medium text-gray-900 capitalize">{cat.name}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}