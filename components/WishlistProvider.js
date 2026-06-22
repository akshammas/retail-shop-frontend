// components/WishlistProvider.js

"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthProvider"
import { getWishlistIds, addToWishlist, removeFromWishlist } from "@/lib/api"

const WishlistContext = createContext({
  wishlistIds: [],
  isWishlisted: () => false,
  toggle: async () => {},
  loading: true,
})

export function WishlistProvider({ children }) {
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [wishlistIds, setWishlistIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isLoggedIn) {
      setWishlistIds([])
      setLoading(false)
      return
    }
    getWishlistIds()
      .then(setWishlistIds)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [authLoading, isLoggedIn])

  const isWishlisted = useCallback(
    (productId) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  async function toggle(productId, onRequireLogin) {
    if (!isLoggedIn) {
      onRequireLogin?.()
      return
    }

    const currentlyIn = wishlistIds.includes(productId)

    setWishlistIds(prev =>
      currentlyIn ? prev.filter(id => id !== productId) : [...prev, productId]
    )

    try {
      if (currentlyIn) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(productId)
      }
    } catch (err) {
      setWishlistIds(prev =>
        currentlyIn ? [...prev, productId] : prev.filter(id => id !== productId)
      )
      console.error(err)
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggle, loading }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}