export default function Gallery({
  photo1,
  photo2,
  photo3,
  overlayText,
}: {
  photo1?: string
  photo2?: string
  photo3?: string
  overlayText?: string
}) {
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column"
    }}>
      {photo1 && (
        <div style={{ width: "100%", height: "30%", overflow: "hidden" }}>
          <img src={photo1} alt="Gallery 1"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

      {photo2 && (
        <div style={{ width: "100%", height: "40%", overflow: "hidden", position: "relative" }}>
          <img src={photo2} alt="Gallery 2"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {overlayText && (
            <div style={{
              position: "absolute", bottom: 16, left: 20, right: 20
            }}>
              <p style={{
                fontFamily: "Georgia, serif", fontStyle: "italic",
                fontSize: 14, color: "#fff", lineHeight: 1.5,
                textShadow: "0 2px 8px rgba(0,0,0,0.6)"
              }}>
                {overlayText}
              </p>
            </div>
          )}
        </div>
      )}

      {photo3 && (
        <div style={{ width: "100%", height: "30%", overflow: "hidden" }}>
          <img src={photo3} alt="Gallery 3"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
    </div>
  )
}