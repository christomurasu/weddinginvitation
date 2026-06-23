import { supabase } from "../../lib/supabase"
import RSVPButtons from "./RSVPButtons"
import WishForm from "./Wishform"
import CoverPage from "./CoverPage"
import MusicPlayer from "./MusicPlayer"
import CountdownTimer from "./CountdownTimer"
import ViewportFix from "./ViewportFix"
import Gallery from "./Gallery"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params

  const { data: guest } = await supabase
    .from("guests")
    .select("weddings(logo_url, partner1, partner2)")
    .eq("code", code)
    .single()

  const wedding = guest?.weddings as { logo_url?: string; partner1?: string; partner2?: string } | undefined

  return {
    title: wedding ? `${wedding.partner1} & ${wedding.partner2}` : "SF Invitation",
    icons: wedding?.logo_url ? { icon: wedding.logo_url } : undefined,
  }
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const { data: guest, error } = await supabase
    .from("guests")
    .select("*, weddings(*)")
    .eq("code", code)
    .single()

  if (error || !guest) {
    return (
      <div style={{
        minHeight: "100vh", background: "#faf7f2",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#888780", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Invitation not found
          </p>
          <p style={{ color: "#b4b2a9", fontSize: 11, marginTop: 8 }}>{code}</p>
        </div>
      </div>
    )
  }

  const wedding = guest.weddings

  const photoList = (await supabase
    .from("wedding_photos")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("order_index", { ascending: true })).data ?? []

  const wishes = (await supabase
    .from("wishes")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false })).data ?? []

  const isCeremonyOnly = guest.invitation_type === "ceremony"

  const bgStyle = wedding.cover_photo_url
    ? `url('${wedding.cover_photo_url}') center/cover no-repeat fixed`
    : "#d6cfc6"

  const hasGallery = wedding.gallery1_url || wedding.gallery2_url || wedding.gallery3_url

  return (
    <>
      <ViewportFix />
      {wedding.music_url && <MusicPlayer musicUrl={wedding.music_url} />}

      <style>{`
        :root { --vh: 1vh; }

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
          height: calc(var(--vh, 1vh) * 100);
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          box-shadow: 0 0 60px rgba(0,0,0,0.3);
          position: relative;
          -webkit-overflow-scrolling: touch;
        }

        .snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          height: calc(var(--vh, 1vh) * 100);
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          min-height: calc(var(--vh, 1vh) * 100);
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
          <CoverPage
            partner1={wedding.partner1}
            partner2={wedding.partner2}
            date={wedding.date}
            couplePhotoUrl={wedding.couple_photo_url}
            coverPhotoUrl={wedding.cover_photo_url}
            verse={wedding.verse}
            verseSource={wedding.verse_source}
            logoUrl={wedding.logo_url}
            frameUrl={wedding.frame_url}
          />
        </div>

        {hasGallery && (
          <div className="snap-section" style={{ height: "100%" }}>
            <Gallery
              photo1={wedding.gallery1_url}
              photo2={wedding.gallery2_url}
              photo3={wedding.gallery3_url}
              overlayText={wedding.gallery_overlay_text}
            />
          </div>
        )}

        <div className="snap-section" style={{ background: "#faf7f2" }}>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "48px 32px", textAlign: "center"
          }}>
            <div style={{ marginBottom: 36 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#b8965a", marginBottom: 12 }}>
                Mempelai Pria
              </p>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 300, color: "#2c2c2a", marginBottom: 8 }}>
                {wedding.partner1}
              </h2>
              {(wedding.groom_father || wedding.groom_mother) && (
                <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.8 }}>
                  {wedding.groom_child_order && "Putra " + wedding.groom_child_order + " dari"}
                  <br />
                  {wedding.groom_father && "Bapak " + wedding.groom_father}
                  {wedding.groom_father && wedding.groom_mother && " & "}
                  {wedding.groom_mother && "Ibu " + wedding.groom_mother}
                </p>
              )}
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 28, color: "#b8965a", marginBottom: 36 }}>
              &amp;
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#b8965a", marginBottom: 12 }}>
                Mempelai Wanita
              </p>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 300, color: "#2c2c2a", marginBottom: 8 }}>
                {wedding.partner2}
              </h2>
              {(wedding.bride_father || wedding.bride_mother) && (
                <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.8 }}>
                  {wedding.bride_child_order && "Putri " + wedding.bride_child_order + " dari"}
                  <br />
                  {wedding.bride_father && "Bapak " + wedding.bride_father}
                  {wedding.bride_father && wedding.bride_mother && " & "}
                  {wedding.bride_mother && "Ibu " + wedding.bride_mother}
                </p>
              )}
            </div>
          </div>
        </div>

        {photoList[1] && (
          <div className="snap-section">
            <img src={photoList[1].url} alt="Photo 2"
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
        )}

        <div className="snap-section" style={{ background: "#f5f0e8" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {wedding.ceremony_image_url ? (
              <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                <img src={wedding.ceremony_image_url} alt="Gereja"
                  style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0 }} />
              </div>
            ) : (
              <div style={{ flex: 1, background: "#ede5d8" }} />
            )}
            <div style={{ padding: "24px 28px 32px", background: "#f5f0e8", textAlign: "center" }}>
              {wedding.wedding_date_iso && (
                <div style={{ marginBottom: 16 }}>
                  <CountdownTimer targetDate={wedding.wedding_date_iso} />
                </div>
              )}
              <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#3b5c2f", marginBottom: 8 }}>
                Holy Matrimony
              </p>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 400, color: "#2c2c2a", marginBottom: 4 }}>
                {wedding.ceremony_venue}
              </h2>
              <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.6, marginBottom: 4 }}>
                {wedding.ceremony_address}
              </p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#b8965a" }}>
                {wedding.ceremony_time}
              </p>
            </div>
          </div>
        </div>

        {!isCeremonyOnly && (
          <div className="snap-section" style={{ background: "#f5f0e8" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {wedding.reception_image_url ? (
                <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                  <img src={wedding.reception_image_url} alt="Venue Resepsi"
                    style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0 }} />
                </div>
              ) : (
                <div style={{ flex: 1, background: "#ede5d8" }} />
              )}
              <div style={{ padding: "24px 28px 32px", background: "#f5f0e8", textAlign: "center" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#3b5c2f", marginBottom: 8 }}>
                  Reception
                </p>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 400, color: "#2c2c2a", marginBottom: 4 }}>
                  {wedding.reception_venue}
                </h2>
                <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.6, marginBottom: 4 }}>
                  {wedding.reception_address}
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#b8965a" }}>
                  {wedding.reception_time}
                </p>
              </div>
            </div>
          </div>
        )}

        {photoList[2] && (
          <div className="snap-section">
            <img src={photoList[2].url} alt="Photo 3"
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
        )}

        <div className="snap-section-auto" style={{ background: "#2c2c2a" }}>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            padding: "48px 28px", maxWidth: 560, margin: "0 auto", width: "100%"
          }}>
            <p style={{
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#b8965a", marginBottom: 28, textAlign: "center"
            }}>
              Ucapan &amp; Doa
            </p>
            <WishForm weddingId={wedding.id} />
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              {wishes.length > 0 ? wishes.map((w: { id: string; guest_name: string; message: string }) => (
                <div key={w.id} style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "16px 20px"
                }}>
                  <p style={{
                    fontFamily: "Georgia, serif", fontStyle: "italic",
                    fontSize: 14, color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.7, marginBottom: 10
                  }}>
                    &ldquo;{w.message}&rdquo;
                  </p>
                  <p style={{ fontSize: 11, color: "#b8965a", letterSpacing: "0.1em" }}>
                    &mdash; {w.guest_name}
                  </p>
                </div>
              )) : (
                <p style={{
                  textAlign: "center", color: "rgba(255,255,255,0.3)",
                  fontSize: 13, fontStyle: "italic", fontFamily: "Georgia, serif"
                }}>
                  Jadilah yang pertama memberikan ucapan.
                </p>
              )}
            </div>
          </div>
        </div>

        {photoList[3] && (
          <div className="snap-section">
            <img src={photoList[3].url} alt="Photo 4"
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
        )}

        <div className="snap-section" style={{ background: "#faf7f2" }}>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "32px 24px", width: "100%", maxWidth: 480, margin: "0 auto"
          }}>
            {guest.note && (
              <div style={{
                background: "#fdf8ee", border: "1px solid #e8d5a3",
                padding: "20px 24px", marginBottom: 20, width: "100%"
              }}>
                <p style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#b8965a", marginBottom: 8 }}>
                  A Personal Note
                </p>
                <p style={{ color: "#2c2c2a", fontStyle: "italic", fontSize: 14, lineHeight: 1.7, fontFamily: "Georgia, serif" }}>
                  {guest.note}
                </p>
              </div>
            )}
            <div style={{ width: "100%" }}>
              <RSVPButtons
                guestCode={code}
                initialStatus={guest.rsvp}
                rsvpDeadline={wedding.rsvp_deadline}
                maxAttendees={guest.max_attendees ?? 1}
                initialAttendees={guest.actual_attendees ?? 1}
              />
            </div>
          </div>
        </div>

        {photoList[4] && (
          <div className="snap-section">
            <img src={photoList[4].url} alt="Photo 5"
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
          </div>
        )}

        <div className="snap-section" style={{ background: "#2c2c2a" }}>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "48px 32px"
          }}>
            {wedding.logo_url && (
              <img src={wedding.logo_url} alt="Logo"
                style={{ width: 70, height: 70, objectFit: "contain", marginBottom: 20, opacity: 0.6 }} />
            )}
            <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 22, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
              {wedding.partner1} &amp; {wedding.partner2}
            </p>
            <p style={{ fontSize: 12, color: "#888780", marginBottom: 32 }}>
              {wedding.date}
            </p>
            <div style={{ width: 40, height: 1, background: "#b8965a", marginBottom: 32 }} />
            <p style={{ fontSize: 10, color: "#444441", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Made with SF Invitation
            </p>
          </div>
        </div>

      </div>
    </>
  )
}