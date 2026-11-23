import type { Metadata } from "next"
import { headers } from "next/headers"
import { Instrument_Serif, Instrument_Sans, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { PRODUCT_TONE_GRADIENTS } from "@/lib/product-visual"
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
    default: "RM Gerobak Hayam Taman Sari — Kasir, Admin & Owner",
    template: "%s · RM Gerobak Hayam Taman Sari",
  },
  description:
    "Sistem kasir RM Gerobak Hayam Taman Sari untuk mengelola pesanan, menu, stok, dan laporan penjualan.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const nonce = (await headers()).get("x-nonce") ?? ""
  const toneCss = PRODUCT_TONE_GRADIENTS.map(
    (gradient, index) => `.product-tone-${index}{background-image:${gradient}}`,
  ).join("")

  return (
    <html lang="id">
      <body className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased`}>
        <style nonce={nonce} dangerouslySetInnerHTML={{ __html: toneCss }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
