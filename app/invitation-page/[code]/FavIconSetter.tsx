"use client"
import { useEffect } from "react"

export default function FavIconSetter({ url }: { url: string }) {
  useEffect(() => {
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.head.appendChild(link)
    }
    link.href = url
  }, [url])

  return null
}