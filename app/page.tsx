import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-amber-600 text-xs tracking-widest uppercase mb-4">
          Wedding Invitation System
        </p>
        <h1 className="text-5xl font-light text-stone-800 mb-6">
          Ahmad & Bella
        </h1>
        <p className="text-stone-400 text-sm mb-10">
          14 June 2025 · The Grand Ballroom
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/dashboard" className="bg-stone-800 text-white px-6 py-3 text-xs tracking-widest uppercase">
            Dashboard
          </a>
          <a href="/i/INV-TEST01" className="border border-stone-300 text-stone-600 px-6 py-3 text-xs tracking-widest uppercase">
            View Invitation
          </a>
        </div>
      </div>
    </div>
  )
}