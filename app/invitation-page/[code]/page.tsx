import { supabase } from "../../lib/supabase"
import RSVPButtons from "./RSVPButtons"
import WishForm from "./Wishform"
import CoverPage from "./CoverPage"
import MusicPlayer from "./MusicPlayer"

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
          <p style={{
            color: "#888780", fontSize: 13,
            letterSpacing: "0.2em", textTransform: "uppercase"
          }}>
            Invitation not found
          </p>
          <p style={{ color: "#b4b2a9", fontSize: 11, marginTop: 8 }}>{code}</p>
        </div>
      </div>
    )
  }

  const wedding = guest.weddings

  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("order_index", { ascending: true })

  const { data: wishes } = await supabase
    .from("wishes")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false })

  const photoList = photos ?? []

  return (
    <>
      {/* Music player */}
      {wedding.music_url && (
        <MusicPlayer musicUrl={wedding.music_url} />
      )}

      {/* Snap scroll styles */}
      <style>{`
        html {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
          height: 100%;
        }
        body {
          height: 100%;
          margin: 0;
        }
        .snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          min-height: 100svh;
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
      `}</style>

      {/* 1. COVER PAGE */}
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
        />
      </div>

      {/* 2. FOTO 1 */}
      {photoList[0] && (
        <div className="snap-section">
          <img
            src={photoList[0].url}
            alt="Photo 1"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              position: "absolute", top: 0, left: 0
            }}
          />
        </div>
      )}

      {/* 3. NAMA MEMPELAI & ORTU */}
      <div className="snap-section" style={{ background: "#faf7f2" }}>
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "48px 32px", textAlign: "center"
        }}>
          {/* Mempelai Pria */}
          <div style={{ marginBottom: 36 }}>
            <p style={{
              fontSize: 10, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "#b8965a", marginBottom: 12
            }}>
              Mempelai Pria
            </p>
            <h2 style={{
              fontFamily: "Georgia, serif", fontSize: 30,
              fontWeight: 300, color: "#2c2c2a", marginBottom: 8
            }}>
              {wedding.partner1}
            </h2>
            {(wedding.groom_father || wedding.groom_mother) && (
              <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.8 }}>
                {wedding.groom_child_order && `Putra ${wedding.groom_child_order} dari`}
                <br />
                {wedding.groom_father && `Bapak ${wedding.groom_father}`}
                {wedding.groom_father && wedding.groom_mother && " & "}
                {wedding.groom_mother && `Ibu ${wedding.groom_mother}`}
              </p>
            )}
          </div>

          <div style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 28, color: "#b8965a", marginBottom: 36
          }}>
            &
          </div>

          {/* Mempelai Wanita */}
          <div>
            <p style={{
              fontSize: 10, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "#b8965a", marginBottom: 12
            }}>
              Mempelai Wanita
            </p>
            <h2 style={{
              fontFamily: "Georgia, serif", fontSize: 30,
              fontWeight: 300, color: "#2c2c2a", marginBottom: 8
            }}>
              {wedding.partner2}
            </h2>
            {(wedding.bride_father || wedding.bride_mother) && (
              <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.8 }}>
                {wedding.bride_child_order && `Putri ${wedding.bride_child_order} dari`}
                <br />
                {wedding.bride_father && `Bapak ${wedding.bride_father}`}
                {wedding.bride_father && wedding.bride_mother && " & "}
                {wedding.bride_mother && `Ibu ${wedding.bride_mother}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. FOTO 2 */}
      {photoList[1] && (
        <div className="snap-section">
          <img
            src={photoList[1].url}
            alt="Photo 2"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              position: "absolute", top: 0, left: 0
            }}
          />
        </div>
      )}

      {/* 5. JADWAL */}
      <div className="snap-section" style={{ background: "#faf7f2" }}>
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "48px 32px", textAlign: "center"
        }}>
          <p style={{
            fontSize: 10, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "#b8965a", marginBottom: 40
          }}>
            Jadwal Pernikahan
          </p>
          <div style={{
            background: "#fff", border: "1px solid #e4ddd0",
            padding: "36px 32px", position: "relative",
            width: "100%", maxWidth: 400
          }}>
            <div style={{
              position: "absolute", top: 6, left: 6, right: 6, bottom: 6,
              border: "1px solid #f0e8d5", pointerEvents: "none"
            }} />
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 24,
              fontWeight: 300, color: "#2c2c2a", marginBottom: 8
            }}>
              {wedding.date}
            </p>
            <div style={{
              width: 40, height: 1,
              background: "#b8965a", margin: "16px auto"
            }} />
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 18,
              fontWeight: 300, color: "#2c2c2a", marginBottom: 4
            }}>
              {wedding.venue}
            </p>
            <p style={{ fontSize: 13, color: "#888780", lineHeight: 1.6 }}>
              {wedding.venue_address}
            </p>
          </div>
        </div>
      </div>

      {/* 6. FOTO 3 */}
      {photoList[2] && (
        <div className="snap-section">
          <img
            src={photoList[2].url}
            alt="Photo 3"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              position: "absolute", top: 0, left: 0
            }}
          />
        </div>
      )}

      {/* 7. UCAPAN */}
      <div className="snap-section" style={{ background: "#2c2c2a", overflowY: "auto" }}>
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: "48px 28px",
          maxWidth: 560, margin: "0 auto", width: "100%"
        }}>
          <p style={{
            fontSize: 10, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "#b8965a",
            marginBottom: 28, textAlign: "center"
          }}>
            Ucapan & Doa
          </p>

          <WishForm weddingId={wedding.id} />

          <div style={{
            marginTop: 24, display: "flex",
            flexDirection: "column", gap: 12,
            overflowY: "auto", flex: 1
          }}>
            {wishes && wishes.length > 0 ? wishes.map((w: {
              id: string
              guest_name: string
              message: string
            }) => (
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
                  — {w.guest_name}
                </p>
              </div>
            )) : (
              <p style={{
                textAlign: "center", color: "rgba(255,255,255,0.3)",
                fontSize: 13, fontStyle: "italic",
                fontFamily: "Georgia, serif"
              }}>
                Jadilah yang pertama memberikan ucapan.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 8. FOTO 4 */}
      {photoList[3] && (
        <div className="snap-section">
          <img
            src={photoList[3].url}
            alt="Photo 4"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              position: "absolute", top: 0, left: 0
            }}
          />
        </div>
      )}

      {/* 9. RSVP */}
      <div className="snap-section" style={{ background: "#faf7f2" }}>
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "32px 24px", width: "100%",
          maxWidth: 480, margin: "0 auto"
        }}>
          {guest.note && (
            <div style={{
              background: "#fdf8ee", border: "1px solid #e8d5a3",
              padding: "20px 24px", marginBottom: 20, width: "100%"
            }}>
              <p style={{
                fontSize: 9, letterSpacing: "0.28em",
                textTransform: "uppercase", color: "#b8965a", marginBottom: 8
              }}>
                A Personal Note
              </p>
              <p style={{
                color: "#2c2c2a", fontStyle: "italic",
                fontSize: 14, lineHeight: 1.7,
                fontFamily: "Georgia, serif"
              }}>
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

      {/* 10. FOTO 5 */}
      {photoList[4] && (
        <div className="snap-section">
          <img
            src={photoList[4].url}
            alt="Photo 5"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              position: "absolute", top: 0, left: 0
            }}
          />
        </div>
      )}

      {/* 11. FOOTER */}
      <div className="snap-section" style={{ background: "#2c2c2a" }}>
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "48px 32px"
        }}>
          {wedding.logo_url && (
            <img
              src={wedding.logo_url}
              alt="Logo"
              style={{
                width: 70, height: 70,
                objectFit: "contain",
                marginBottom: 20, opacity: 0.6
              }}
            />
          )}
          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 22, color: "rgba(255,255,255,0.6)", marginBottom: 8
          }}>
            {wedding.partner1} & {wedding.partner2}
          </p>
          <p style={{ fontSize: 12, color: "#888780", marginBottom: 32 }}>
            {wedding.date}
          </p>
          <div style={{
            width: 40, height: 1,
            background: "#b8965a", marginBottom: 32
          }} />
          <p style={{
            fontSize: 10, color: "#444441",
            letterSpacing: "0.15em", textTransform: "uppercase"
          }}>
            Made with SF Invitation
          </p>
        </div>
      </div>
    </>
  )
}