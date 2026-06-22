// app/layout.js — correct, single set of imports

import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { WishlistProvider } from "@/components/WishlistProvider"
import Navbar from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Retail Shop",
  description: "Your one-stop shop",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WishlistProvider>
            <Navbar />
            {children}
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}