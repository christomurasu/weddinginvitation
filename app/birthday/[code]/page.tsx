import { supabase } from "../../lib/supabase"
import type { Metadata } from "next"
import MenuPicker from "./MenuPicker"
import { RsvpProvider, RsvpButtons } from "./Rsvp"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  const { data: guest } = await supabase.from("birthday_guests")
    .select("birthdays(event_title, cover_url, share_description, share_image_url, icon_url)").eq("code", code).single()
  const b = guest?.birthdays as {
    event_title?: string; cover_url?: string; share_description?: string; share_image_url?: string; icon_url?: string
  } | undefined
  const title = b?.event_title || "SF Invitation"
  const description = b?.share_description || "You are invited!"
  const image = b?.share_image_url || b?.cover_url
  const images = image ? [{ url: image }] : []
  // Semua field di-set eksplisit supaya tidak mewarisi favicon/OG wedding dari app/layout.tsx
  return {
    title,
    description,
    icons: { icon: b?.icon_url || "/favicon.ico", apple: b?.icon_url || "/favicon.ico" },
    openGraph: { title, description, images, type: "website", siteName: "SF Invitation" },
    twitter: { card: "summary_large_image", title, description, images },
  }
}

// Background penuh per page; kosong → hitam
function bg(url?: string | null) {
  return url
    ? { backgroundImage: `url('${url}')`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: "#0b0000" }
}

export default async function BirthdayInvitationPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const { data: guest, error } = await supabase.from("birthday_guests").select("*, birthdays(*)").eq("code", code).single()

  if (error || !guest) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0b0000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#888780", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" }}>Invitation not found</p>
          <p style={{ color: "#b4b2a9", fontSize: 11, marginTop: 8 }}>{code}</p>
        </div>
      </div>
    )
  }

  const b = guest.birthdays
  const menuItems = (await supabase.from("birthday_menu_items").select("id, name, kind, category").eq("birthday_id", b.id).order("order_index", { ascending: true })).data ?? []

  const label = { fontSize: "3.6cqw", color: "#8a8a8a", letterSpacing: "0.02em", lineHeight: 1.35 }
  const value = { fontSize: "3.6cqw", color: "#1a1a1a", fontWeight: 700, lineHeight: 1.35 }

  return (
    <>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        body { background: #000; display: flex; justify-content: center; font-family: 'Inter', sans-serif; }
        * { box-sizing: border-box; }
        p { margin: 0; }

        #bday-wrapper {
          width: 100%; max-width: 480px; height: 100dvh;
          overflow-y: scroll; scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch; position: relative;
        }
        .bday-section {
          scroll-snap-align: start; scroll-snap-stop: always;
          height: 100dvh; width: 100%; position: relative; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .bday-img { display: block; max-width: 100%; }
        /* Belum jawab → hanya page 1-2; hadir → page 3-5; tidak hadir → page 6 */
        #bday-wrapper:not([data-rsvp="attending"]) .only-attending,
        #bday-wrapper:not([data-rsvp="declined"]) .only-declined { display: none; }
        @keyframes bday-bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>

      <RsvpProvider initial={guest.rsvp === "attending" || guest.rsvp === "declined" ? guest.rsvp : null}>

        {/* Page 1 — cover full */}
        <div className="bday-section" style={{ background: "#0b0000" }}>
          {b.cover_url && (
            <img src={b.cover_url} alt={b.event_title ?? "Cover"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: "3dvh", textAlign: "center", color: "#fff" }}>
            <p style={{ fontSize: 14, animation: "bday-bounce 1.6s ease-in-out infinite" }}>↓</p>
            <p style={{ fontSize: 10, letterSpacing: "0.08em" }}>Scroll</p>
          </div>
        </div>

        {/* Page 2 — tiket */}
        <div className="bday-section" style={{ ...bg(b.bg2_url), alignItems: "center", padding: "5dvh 0 3dvh" }}>
          <div style={{ width: "min(80%, calc((100dvh - 140px) * 0.55))", color: "#fff", marginBottom: "2dvh" }}>
            <p style={{ fontSize: 12 }}>Dear <b>{guest.name}</b>,</p>
            <p style={{ fontSize: 11, fontWeight: 300 }}>You are invited to celebrate :</p>
          </div>

          {/* ponytail: posisi overlay pakai % dari ukuran tiket di screenshot, tuning ulang dari Figma */}
          <div style={{ position: "relative", width: "min(80%, calc((100dvh - 140px) * 0.55))", containerType: "inline-size" }}>
            {b.ticket_url
              ? <img src={b.ticket_url} alt="" className="bday-img" style={{ width: "100%" }} />
              : <div style={{ width: "100%", aspectRatio: "0.55", background: "#fff" }} />}

            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ height: "13%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#fff", fontSize: "5cqw", fontWeight: 600, letterSpacing: "0.12em" }}>{b.premiere_title}</p>
              </div>

              <div style={{ height: "28%", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6%" }}>
                {b.title_image_url && (
                  <img src={b.title_image_url} alt={b.event_title ?? ""} className="bday-img" style={{ maxHeight: "90%", objectFit: "contain" }} />
                )}
              </div>

              <div style={{ flex: 1, padding: "5% 11% 0", display: "flex", flexDirection: "column", gap: "4cqw" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "3cqw" }}>
                  <p style={label}>STARRING</p><p style={value}>{b.celebrant_name}</p>
                  <p style={label}>GENRE</p><p style={value}>{b.genre}</p>
                  <p style={label}>AGE</p><p style={value}>{b.age}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "auto auto", justifyContent: "start", columnGap: "8cqw", whiteSpace: "nowrap" }}>
                  <p style={label}>BIRTHDAY PREMIERE</p><p style={label}>SHOW TIME</p>
                  <p style={{ ...value, fontWeight: 400 }}>{b.premiere_date}</p><p style={{ ...value, fontWeight: 400 }}>{b.show_time}</p>
                </div>
                <div>
                  <p style={label}>VENUE</p>
                  <p style={{ ...value, fontWeight: 400 }}>{b.venue}</p>
                  {b.venue_address && <p style={{ ...value, fontWeight: 400, marginTop: "1cqw" }}>{b.venue_address}</p>}
                </div>
              </div>

              <div style={{ height: "22%", padding: "0 0 7%" }}>
                <RsvpButtons guestCode={code} />
              </div>
            </div>
          </div>
        </div>

        {/* Page 3 — casting call (hadir) */}
        <div className="bday-section only-attending" style={{ ...bg(b.bg3_url), alignItems: "center", padding: "8dvh 6% 0" }}>
          {b.casting_title_url && (
            <img src={b.casting_title_url} alt="Casting Call" className="bday-img" style={{ width: "80%", marginBottom: "4dvh" }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "3%", width: "100%" }}>
            <div style={{ width: "12%", flexShrink: 0 }}>
              {b.casting_icon_left_url && <img src={b.casting_icon_left_url} alt="" className="bday-img" style={{ width: "100%" }} />}
            </div>
            <p style={{
              flex: 1, color: "#fff", fontWeight: 700, textAlign: "center",
              fontSize: "clamp(11px, 3.4vw, 15px)", lineHeight: 1.35, whiteSpace: "pre-line"
            }}>
              {b.casting_text}
            </p>
            <div style={{ width: "12%", flexShrink: 0 }}>
              {b.casting_icon_right_url && <img src={b.casting_icon_right_url} alt="" className="bday-img" style={{ width: "100%" }} />}
            </div>
          </div>
          {b.chair_url && (
            <img src={b.chair_url} alt="" className="bday-img" style={{ marginTop: "auto", width: "70%", maxHeight: "45dvh", objectFit: "contain", objectPosition: "bottom" }} />
          )}
        </div>

        {/* Page 4 — menu (hadir) */}
        <div className="bday-section only-attending" style={{ ...bg(b.bg4_url), padding: "2dvh 5% 3dvh" }}>
          {b.menu_title_url && (
            <img src={b.menu_title_url} alt="Menu" className="bday-img" style={{ width: "100%", maxHeight: "22dvh", objectFit: "contain", margin: "0 auto 2dvh" }} />
          )}
          <p style={{ color: "#fff", fontSize: 10, lineHeight: 1.4, marginBottom: "2dvh", padding: "0 2%" }}>{b.menu_text}</p>
          <MenuPicker guestCode={code} items={menuItems} initialFood={guest.menu_item_id ?? null} initialDrink={guest.drink_item_id ?? null} initialNote={guest.menu_note ?? ""} />
        </div>

        {/* Page 5 — see you there (hadir) */}
        <div className="bday-section only-attending" style={{ ...bg(b.bg5_url), alignItems: "center", justifyContent: "center" }}>
          {b.see_you_url && <img src={b.see_you_url} alt="See you there!" className="bday-img" style={{ width: "100%", maxHeight: "90dvh", objectFit: "contain" }} />}
        </div>

        {/* Page 6 — terima kasih (tidak hadir) */}
        <div className="bday-section only-declined" style={{ ...bg(b.bg6_url), alignItems: "center", justifyContent: "center", gap: "3dvh", padding: "0 8%" }}>
          {b.photo_url && <img src={b.photo_url} alt="" className="bday-img" style={{ width: "100%", maxHeight: "65dvh", objectFit: "contain" }} />}
          <p style={{
            color: "#fff", fontWeight: 700, textAlign: "center", letterSpacing: "0.04em",
            fontSize: "clamp(14px, 4.4vw, 20px)", lineHeight: 1.35, whiteSpace: "pre-line"
          }}>
            {b.thanks_text || "THANK YOU FOR YOUR CONFIRMATION"}
          </p>
        </div>

      </RsvpProvider>
    </>
  )
}
