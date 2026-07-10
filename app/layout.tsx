import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SF Invitation",
  description: "Digital Wedding Invitations",
  icons: {
    icon: "https://ervlyplqjeszzmetmcsl.supabase.co/storage/v1/object/public/wedding-photos/96fdd251-193e-46f5-9c3d-0b1db3b20f5a/logo_url-1782405949522.png",
  }
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