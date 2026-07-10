import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://sfinvitation.id"),
  title: "SF Invitation",
  description: "Digital Wedding Invitations",
  icons: {
    icon: "https://ervlyplqjeszzmetmcsl.supabase.co/storage/v1/object/public/wedding-photos/96fdd251-193e-46f5-9c3d-0b1db3b20f5a/logo_url-1782405949522.png",
  },
  openGraph: {
    title: "SF Invitation",
    description: "Digital Wedding Invitations",
    url: "https://sfinvitation.id",
    siteName: "SF Invitation",
    type: "website",
    images: [
      {
        url: "/SF_for_link.jpg",
        width: 1080,
        height: 1080,
        alt: "SF Invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SF Invitation",
    description: "Digital Wedding Invitations",
    images: ["/SF_for_link.jpg"],
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