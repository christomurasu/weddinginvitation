import { supabase } from "../../lib/supabase"
import PagarAyuSearch from "./PagarAyuSearch"

export default async function PagarAyuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, partner1, partner2, slug, cover_photo_url")
    .eq("slug", slug)
    .single()

  if (!wedding) {
    return (
      <div style={{ minHeight: "100vh", background: "#2c2c2a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888780", fontSize: 13 }}>Wedding not found</p>
      </div>
    )
  }

  return <PagarAyuSearch weddingId={wedding.id} partner1={wedding.partner1} partner2={wedding.partner2} coverPhotoUrl={wedding.cover_photo_url} />
}