import type { Metadata } from "next"
import { Instrument_Serif, Instrument_Sans, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
})

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: {
    default: "Point of Sale — Kasir, Admin & Owner",
    template: "%s · Point of Sale",
  },
  description: "Sistem point of sale untuk mengelola pesanan, menu, stok, dan laporan penjualan.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
