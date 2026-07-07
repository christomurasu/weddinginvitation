import { Suspense } from "react"
import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", background: "#faf7f2",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <p style={{ color: "#888780", fontSize: 13 }}>Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}