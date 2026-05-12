import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SF Invitation",
  description: "Digital Wedding Invitation",
  icons: {
    icon: "/images/SF_Invitation_Logo.png",
    apple: "/images/SF_Invitation_Logo.png",
  },
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