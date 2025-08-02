import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { initializeDatabase } from "@/lib/mongodb"

export const metadata: Metadata = {
  title: "Daily Reflection App",
  description: "Track your daily thoughts and reflections",
  generator: "v0.dev",
}

// Initialize database on app startup
if (typeof window === "undefined") {
  initializeDatabase().catch(console.error)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f5f5f5" }}>{children}</body>
    </html>
  )
}
