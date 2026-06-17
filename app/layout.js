// app/layout.js

import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { AuthProvider } from "@/components/AuthProvider"
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
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}