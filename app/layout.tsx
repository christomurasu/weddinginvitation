import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SF Invitation",
  description: "Digital Wedding Invitation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}