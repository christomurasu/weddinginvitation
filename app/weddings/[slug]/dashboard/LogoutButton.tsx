"use client"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        position: "absolute", right: 24, top: "50%",
        transform: "translateY(-50%)",
        background: "transparent", border: "1px solid #444441",
        color: "#888780", padding: "6px 14px",
        fontSize: 10, letterSpacing: "0.12em",
        textTransform: "uppercase", cursor: "pointer",
        fontFamily: "inherit"
      }}
    >
      Logout
    </button>
  )
}