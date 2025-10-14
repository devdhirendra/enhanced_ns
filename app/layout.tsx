import type React from "react"
import type { Metadata } from "next"
//import { Inter } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
// import { InstantMessage } from "@/components/ui/instant-message"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

// const inter = Inter({ subsets: ["latin"] })
// app/fonts.ts
import localFont from "next/font/local"

export const inter = localFont({
  src: "./../public/fonts/Inter/static/Inter_24pt-Regular.ttf",
  display: "swap",
  variable: "--font-inter",
})

export const pacifico = localFont({
  src: "./../public/fonts/Pacifico/Pacifico-Regular.ttf",
  display: "swap",
  variable: "--font-pacifico",
})

export const poppins = localFont({
  src: "./../public/fonts/Poppins/Poppins-BoldItalic.ttf",
  display: "swap",
  variable: "--font-poppins",
})
export const metadata: Metadata = {
  title: "My Network Solutions - Complete Network Management System",
  description: "Professional network management dashboard for ISPs and operators",
  generator: "devdhirendra",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          {/* <InstantMessage /> */}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
