"use client"
import RSVPPopup from "./RSVPPopUp"
import { Lang } from "./Translations"

export default function RSVPPopupWrapper({ 
  guestCode, 
  lang,
  onClose
}: { 
  guestCode: string
  lang: Lang
  onClose: () => void
}) {
  return <RSVPPopup guestCode={guestCode} lang={lang} onClose={onClose} />
}