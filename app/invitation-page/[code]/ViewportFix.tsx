"use client"
import { useEffect } from "react"

export default function ViewportFix() {
  useEffect(() => {
    function setVh() {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", vh + "px")
    }
    setVh()
    window.addEventListener("resize", setVh)
    window.addEventListener("orientationchange", () => setTimeout(setVh, 100))
    return () => {
      window.removeEventListener("resize", setVh)
      window.removeEventListener("orientationchange", setVh)
    }
  }, [])

  return null
}