import { supabase } from "../../lib/supabase"
import RSVPSection from "./RSVPSection"
import WishForm from "./Wishform"
import CoverPage from "./CoverPage"
import MusicPlayer from "./MusicPlayer"
import CountdownBanner from "./CountdownBanner"
import ViewportFix from "./ViewportFix"
import Gallery from "./Gallery"
import IntroSection from "./IntroSection"
import DateMapsRow from "./DateMapsRow"
import type { Metadata } from "next"
import { t, Lang } from "./Translations"
import FaviconSetter from "./FavIconSetter"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  const { data: guest } = await supabase.from("guests").select("weddings(logo_url, partner1, partner2, couple_photo_url)").eq("code", code).single()
  const wedding = guest?.weddings as { logo_url?: string; partner1?: string; partner2?: string; couple_photo_url?: string } | undefined
  return {
    title: wedding ? `${wedding.partner1} & ${wedding.partner2}` : "SF Invitation",
    icons: {
      icon: wedding?.logo_url ?? "/favicon.ico",
      apple: wedding?.logo_url ?? "/favicon.ico",
    },
    openGraph: {
      title: wedding ? `${wedding.partner1} & ${wedding.partner2}` : "SF Invitation",
      images: wedding?.couple_photo_url ? [{ url: wedding.couple_photo_url }] : [],
    }
  }
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const { data: guest, error } = await supabase.from("guests").select("*, weddings(*)").eq("code", code).single()

  if (error || !guest) {
    return (
      <div style={{ minHeight: "100dvh", background: "#faf7f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#888780", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" }}>Invitation not found</p>
          <p style={{ color: "#b4b2a9", fontSize: 11, marginTop: 8 }}>{code}</p>
        </div>
      </div>
    )
  }

  const wedding = guest.weddings
  const lang: Lang = guest.language === "id" ? "id" : "en"
  const tr = t[lang]

  const photoList = (await supabase.from("wedding_photos").select("*").eq("wedding_id", wedding.id).order("order_index", { ascending: true })).data ?? []
  const wishes = (await supabase.from("wishes").select("*").eq("wedding_id", wedding.id).order("created_at", { ascending: false })).data ?? []

  const isCeremonyOnly = guest.invitation_type === "ceremony"

  const bgStyle = wedding.cover_photo_url ? `url('${wedding.cover_photo_url}') center/cover no-repeat` : "#d6cfc6"
  const sectionBg = wedding.cover_photo_url
    ? { backgroundImage: `url('${wedding.cover_photo_url}')`, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" as const }
    : { background: "#f5f0e8" }

  const hasGallery = wedding.gallery1_url || wedding.gallery2_url || wedding.gallery3_url

  const isoDate = wedding.wedding_date_iso ? new Date(wedding.wedding_date_iso) : null
  const locale = lang === "id" ? "id-ID" : "en-US"
  const dayName = isoDate ? isoDate.toLocaleDateString(locale, { weekday: "long" }) : ""
  const dayNumber = isoDate ? isoDate.getDate() : ""
  const monthYear = isoDate ? isoDate.toLocaleDateString(locale, { month: "long", year: "numeric" }) : ""

  return (
    <>
      <ViewportFix />
      {wedding.logo_url && <FaviconSetter url={wedding.logo_url} />}
      {wedding.music_url && <MusicPlayer musicUrl={wedding.music_url} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }

        body {
          background: ${bgStyle};
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        #invitation-wrapper {
          width: 100%;
          max-width: 480px;
          height: 100dvh;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          box-shadow: 0 0 60px rgba(0,0,0,0.3);
          position: relative;
          -webkit-overflow-scrolling: touch;
        }

        .snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .snap-section-auto {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          flex-shrink: 0;
          overflow-y: auto;
        }
      `}</style>

      <div id="invitation-wrapper">

        <div className="snap-section" style={{ background: "#f5f0e8" }}>
          <CoverPage partner1={wedding.partner1} partner2={wedding.partner2} date={wedding.date} couplePhotoUrl={wedding.couple_photo_url} coverPhotoUrl={wedding.cover_photo_url} verse={wedding.verse} verseSource={wedding.verse_source} logoUrl={wedding.logo_url} frameUrl={wedding.frame_url} />
        </div>

        {hasGallery && (
          <div className="snap-section">
            <Gallery photo1={wedding.gallery1_url} photo2={wedding.gallery2_url} photo3={wedding.gallery3_url} overlayText={wedding.gallery_overlay_text} />
          </div>
        )}

        <div className="snap-section">
          <IntroSection
            guestGreeting={guest.greeting || "Honoured Guest"}
            name={wedding.partner1}
            parentLabel={tr.firstSonOf}
            parentNames={`${wedding.groom_father ?? ""} & ${wedding.groom_mother ?? ""}`}
            photoUrl={wedding.groom_intro_photo_url}
            backgroundUrl={wedding.groom_intro_bg_url}
            stampUrl={wedding.groom_stamp_url}
            roleLabel={tr.theGroom}
            align="left"
            lang={lang}
          />
        </div>

        <div className="snap-section">
          <IntroSection
            guestGreeting={guest.greeting || "Honoured Guest"}
            name={wedding.partner2}
            parentLabel={tr.firstDaughterOf}
            parentNames={`${wedding.bride_father ?? ""} & ${wedding.bride_mother ?? ""}`}
            photoUrl={wedding.bride_intro_photo_url}
            backgroundUrl={wedding.bride_intro_bg_url}
            stampUrl={wedding.bride_stamp_url}
            roleLabel={tr.theBride}
            align="right"
            showGreeting={false}
            lang={lang}
          />
        </div>

        {photoList[1] && (
          <div className="snap-section">
            <img src={photoList[1].url} alt="Photo 2" style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0 }} />
          </div>
        )}

        {/* Holy Matrimony */}
        <div className="snap-section" style={sectionBg}>
          <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {wedding.wedding_date_iso && <CountdownBanner targetDate={wedding.wedding_date_iso} lang={lang} />}
            <p style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 700,
              fontSize: "clamp(14px, 2.5dvh, 18px)",
              color: "#5F5F5F", textAlign: "center",
              padding: "1.5dvh 28px 1dvh"
            }}>
              {tr.holyMatrimony}
            </p>
            {wedding.ceremony_image_url ? (
              <div style={{ margin: "0 35px", aspectRatio: "325 / 240", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                <img src={wedding.ceremony_image_url} alt="Gereja" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              </div>
            ) : (
              <div style={{ margin: "0 35px", aspectRatio: "325 / 150", background: "#ede5d8", flexShrink: 0 }} />
            )}
            <div style={{ padding: "1dvh 28px 2dvh", textAlign: "center", overflowY: "auto" }}>
              <p style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                fontSize: "clamp(13px, 2dvh, 16px)",
                color: "#5F5F5F", marginBottom: "0.5dvh"
              }}>
                {wedding.ceremony_venue}
              </p>
              <p style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 400,
                fontSize: "clamp(11px, 1.8dvh, 15px)",
                color: "#5F5F5F", lineHeight: 1.5, marginBottom: "1.5dvh"
              }}>
                {wedding.ceremony_address}
              </p>
              <DateMapsRow dayName={dayName} day={dayNumber} monthYear={monthYear} time={wedding.ceremony_time} mapsUrl={wedding.ceremony_maps_url} lang={lang} />
            </div>
          </div>
        </div>

        {/* Reception */}
        {!isCeremonyOnly && (
          <div className="snap-section" style={sectionBg}>
            <div style={{ height: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
              <p style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                fontSize: "clamp(14px, 2.5dvh, 18px)",
                color: "#5F5F5F", textAlign: "center",
                padding: "1.5dvh 28px 1dvh"
              }}>
                {tr.reception}
              </p>
              {wedding.reception_image_url ? (
                <div style={{ margin: "0 35px", aspectRatio: "325 / 280", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  <img src={wedding.reception_image_url} alt="Venue Resepsi" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                </div>
              ) : (
                <div style={{ margin: "0 35px", aspectRatio: "325 / 150", background: "#ede5d8", flexShrink: 0 }} />
              )}
              <div style={{ padding: "1dvh 28px 2dvh", textAlign: "center", overflowY: "auto" }}>
                <p style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                  fontSize: "clamp(13px, 2dvh, 16px)",
                  color: "#5F5F5F", marginBottom: "0.5dvh"
                }}>
                  {wedding.reception_venue}
                </p>
                <p style={{
                  fontFamily: "'Poppins', sans-serif", fontWeight: 400,
                  fontSize: "clamp(11px, 1.8dvh, 15px)",
                  color: "#5F5F5F", lineHeight: 1.5, marginBottom: "1.5dvh"
                }}>
                  {wedding.reception_address}
                </p>
                <DateMapsRow dayName={dayName} day={dayNumber} monthYear={monthYear} time={wedding.reception_time} mapsUrl={wedding.reception_maps_url} lang={lang} />
              </div>
            </div>
          </div>
        )}

        {photoList[2] && (
          <div className="snap-section">
            <img src={photoList[2].url} alt="Photo 3" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
        )}

        {photoList[3] && (
          <div className="snap-section">
            <img src={photoList[3].url} alt="Photo 4" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
        )}

        <div className="snap-section-auto" style={sectionBg}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 24px", width: "100%", maxWidth: 480, margin: "0 auto" }}>
            {guest.note && (
              <div style={{ background: "#fdf8ee", border: "1px solid #e8d5a3", padding: "20px 24px", marginBottom: 24, width: "100%" }}>
                <p style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#b8965a", marginBottom: 8 }}>A Personal Note</p>
                <p style={{ color: "#2c2c2a", fontStyle: "italic", fontSize: 14, lineHeight: 1.7, fontFamily: "Georgia, serif" }}>{guest.note}</p>
              </div>
            )}
            <RSVPSection
              guestCode={code}
              guestGreeting={guest.greeting || "Honoured Guest"}
              isCeremonyOnly={isCeremonyOnly}
              maxAttendees={guest.max_attendees ?? 1}
              ceremonyRsvp={guest.ceremony_rsvp ?? "pending"}
              ceremonyAdults={guest.ceremony_adults ?? 0}
              ceremonyKids={guest.ceremony_kids ?? 0}
              receptionRsvp={guest.reception_rsvp ?? "pending"}
              receptionAdults={guest.reception_adults ?? 0}
              receptionKids={guest.reception_kids ?? 0}
              lang={lang}
            />
            <div style={{ marginTop: 8 }}>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(14px, 2.5dvh, 20px)", color: "#5F5F5F", textAlign: "center", marginBottom: 16 }}>
                {tr.wishes}
              </p>
              <WishForm weddingId={wedding.id} guestName={guest.name} lang={lang} />
            </div>
          </div>
        </div>

        <div className="snap-section" style={sectionBg}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 0" }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(14px, 2.5dvh, 20px)", color: "#5F5F5F", letterSpacing: "0.05em", textAlign: "center", marginBottom: 20 }}>
              {tr.wishesTitle}
            </p>
            <div style={{ margin: "0 25px", background: "#F4F1EA", flex: 1, overflowY: "auto", padding: "16px" }}>
              {wishes.length > 0 ? wishes.map((w: { id: string; guest_name: string; message: string; created_at: string }) => (
                <div key={w.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#888780" }}>
                      {new Date(w.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{ display: "inline-block", background: "#ffffff", padding: "6px 12px", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 14, color: "#5F5F5F" }}>
                      {w.guest_name}
                    </span>
                  </div>
                  <div style={{ background: "#E3E0D9", padding: "12px 14px" }}>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#5F5F5F", lineHeight: 1.6 }}>{w.message}</p>
                  </div>
                </div>
              )) : (
                <p style={{ textAlign: "center", color: "#b4b2a9", fontSize: 13, fontStyle: "italic", fontFamily: "'Poppins', sans-serif", marginTop: 20 }}>
                  {lang === "id" ? "Jadilah yang pertama memberikan ucapan." : "Be the first to leave a wish."}
                </p>
              )}
            </div>
          </div>
        </div>

        {photoList[4] && (
          <div className="snap-section">
            <img src={photoList[4].url} alt="Photo 5" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
        )}

      </div>
    </>
  )
}