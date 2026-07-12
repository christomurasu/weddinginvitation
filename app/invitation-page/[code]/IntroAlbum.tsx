export default function IntroAlbum({
  bgUrl,
  photoUrl,
}: {
  bgUrl: string
  photoUrl?: string
}) {
  return (
    <div style={{
      width: "100%", height: "100%", position: "relative",
      overflow: "hidden",
    }}>
      {/* Background */}
      <img src={bgUrl} alt="Background"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
      />

      {/* Foto tengah */}
      {photoUrl && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "125%",
          aspectRatio: "1 / 1",
          zIndex: 1,
          overflow: "hidden",
        }}>
          <img src={photoUrl} alt="Foto"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
      )}
    </div>
  )
}