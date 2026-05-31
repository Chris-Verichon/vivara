"use client"

import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { DropZone, type UploadFile } from "@/components/upload/DropZone"
import { createMemory } from "@/actions/memories"

// ISO 3166-1 alpha-2 country list (abbreviated — most common)
const COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albanie" }, { code: "DZ", name: "Algérie" },
  { code: "AD", name: "Andorre" }, { code: "AO", name: "Angola" }, { code: "AR", name: "Argentine" },
  { code: "AM", name: "Arménie" }, { code: "AU", name: "Australie" }, { code: "AT", name: "Autriche" },
  { code: "AZ", name: "Azerbaïdjan" }, { code: "BS", name: "Bahamas" }, { code: "BH", name: "Bahreïn" },
  { code: "BD", name: "Bangladesh" }, { code: "BE", name: "Belgique" }, { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Bénin" }, { code: "BT", name: "Bhoutan" }, { code: "BO", name: "Bolivie" },
  { code: "BA", name: "Bosnie-Herzégovine" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brésil" },
  { code: "BN", name: "Brunei" }, { code: "BG", name: "Bulgarie" }, { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" }, { code: "CV", name: "Cabo Verde" }, { code: "KH", name: "Cambodge" },
  { code: "CM", name: "Cameroun" }, { code: "CA", name: "Canada" }, { code: "CF", name: "Centrafrique" },
  { code: "CL", name: "Chili" }, { code: "CN", name: "Chine" }, { code: "CY", name: "Chypre" },
  { code: "CO", name: "Colombie" }, { code: "KM", name: "Comores" }, { code: "CG", name: "Congo" },
  { code: "KR", name: "Corée du Sud" }, { code: "CR", name: "Costa Rica" }, { code: "HR", name: "Croatie" },
  { code: "CU", name: "Cuba" }, { code: "DK", name: "Danemark" }, { code: "DJ", name: "Djibouti" },
  { code: "EG", name: "Égypte" }, { code: "AE", name: "Émirats arabes unis" }, { code: "EC", name: "Équateur" },
  { code: "ER", name: "Érythrée" }, { code: "ES", name: "Espagne" }, { code: "EE", name: "Estonie" },
  { code: "ET", name: "Éthiopie" }, { code: "FJ", name: "Fidji" }, { code: "FI", name: "Finlande" },
  { code: "FR", name: "France" }, { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambie" },
  { code: "GE", name: "Géorgie" }, { code: "GH", name: "Ghana" }, { code: "GR", name: "Grèce" },
  { code: "GT", name: "Guatemala" }, { code: "GN", name: "Guinée" }, { code: "GW", name: "Guinée-Bissau" },
  { code: "GQ", name: "Guinée équatoriale" }, { code: "GY", name: "Guyana" }, { code: "HT", name: "Haïti" },
  { code: "HN", name: "Honduras" }, { code: "HU", name: "Hongrie" }, { code: "IN", name: "Inde" },
  { code: "ID", name: "Indonésie" }, { code: "IQ", name: "Irak" }, { code: "IR", name: "Iran" },
  { code: "IE", name: "Irlande" }, { code: "IS", name: "Islande" }, { code: "IL", name: "Israël" },
  { code: "IT", name: "Italie" }, { code: "JM", name: "Jamaïque" }, { code: "JP", name: "Japon" },
  { code: "JO", name: "Jordanie" }, { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" },
  { code: "KG", name: "Kirghizistan" }, { code: "KW", name: "Koweït" }, { code: "LA", name: "Laos" },
  { code: "LS", name: "Lesotho" }, { code: "LV", name: "Lettonie" }, { code: "LB", name: "Liban" },
  { code: "LR", name: "Liberia" }, { code: "LY", name: "Libye" }, { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lituanie" }, { code: "LU", name: "Luxembourg" }, { code: "MK", name: "Macédoine du Nord" },
  { code: "MG", name: "Madagascar" }, { code: "MY", name: "Malaisie" }, { code: "MW", name: "Malawi" },
  { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" }, { code: "MT", name: "Malte" },
  { code: "MA", name: "Maroc" }, { code: "MR", name: "Mauritanie" }, { code: "MU", name: "Maurice" },
  { code: "MX", name: "Mexique" }, { code: "MD", name: "Moldavie" }, { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolie" }, { code: "ME", name: "Monténégro" }, { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibie" }, { code: "NP", name: "Népal" },
  { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norvège" }, { code: "NZ", name: "Nouvelle-Zélande" }, { code: "OM", name: "Oman" },
  { code: "UG", name: "Ouganda" }, { code: "UZ", name: "Ouzbékistan" }, { code: "PK", name: "Pakistan" },
  { code: "PA", name: "Panama" }, { code: "PG", name: "Papouasie-Nouvelle-Guinée" }, { code: "PY", name: "Paraguay" },
  { code: "NL", name: "Pays-Bas" }, { code: "PE", name: "Pérou" }, { code: "PH", name: "Philippines" },
  { code: "PL", name: "Pologne" }, { code: "PT", name: "Portugal" }, { code: "QA", name: "Qatar" },
  { code: "RO", name: "Roumanie" }, { code: "GB", name: "Royaume-Uni" }, { code: "RU", name: "Russie" },
  { code: "RW", name: "Rwanda" }, { code: "SA", name: "Arabie Saoudite" }, { code: "SN", name: "Sénégal" },
  { code: "RS", name: "Serbie" }, { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapour" },
  { code: "SK", name: "Slovaquie" }, { code: "SI", name: "Slovénie" }, { code: "SO", name: "Somalie" },
  { code: "SD", name: "Soudan" }, { code: "SS", name: "Soudan du Sud" }, { code: "LK", name: "Sri Lanka" },
  { code: "SE", name: "Suède" }, { code: "CH", name: "Suisse" }, { code: "SR", name: "Suriname" },
  { code: "SY", name: "Syrie" }, { code: "TJ", name: "Tadjikistan" }, { code: "TZ", name: "Tanzanie" },
  { code: "TD", name: "Tchad" }, { code: "CZ", name: "Tchéquie" }, { code: "TH", name: "Thaïlande" },
  { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TT", name: "Trinité-et-Tobago" },
  { code: "TN", name: "Tunisie" }, { code: "TM", name: "Turkménistan" }, { code: "TR", name: "Turquie" },
  { code: "UA", name: "Ukraine" }, { code: "UY", name: "Uruguay" }, { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Viêt Nam" }, { code: "YE", name: "Yémen" }, { code: "ZM", name: "Zambie" },
  { code: "ZW", name: "Zimbabwe" },
]

async function uploadFile(
  memoryId: string,
  file: File,
  position: number
): Promise<{ storagePath: string; thumbnailPath: null; width: number | null; height: number | null }> {
  const ext = file.name.split(".").pop() ?? "bin"
  const suffix = `${position}_${Date.now()}.${ext}`

  const presignRes = await fetch("/api/r2/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memoryId, suffix, contentType: file.type }),
  })
  if (!presignRes.ok) throw new Error("Impossible d'obtenir l'URL d'upload.")
  const { url, key } = (await presignRes.json()) as { url: string; key: string }

  const uploadRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  })
  if (!uploadRes.ok) throw new Error("Échec de l'upload.")

  let width: number | null = null
  let height: number | null = null
  if (file.type.startsWith("image/")) {
    await new Promise<void>((resolve) => {
      const img = new window.Image()
      img.onload = () => { width = img.naturalWidth; height = img.naturalHeight; resolve() }
      img.onerror = () => resolve()
      img.src = URL.createObjectURL(file)
    })
  }

  return { storagePath: key, thumbnailPath: null, width, height }
}

async function uploadVideoThumbnail(
  memoryId: string,
  thumbnailDataUrl: string,
  position: number
): Promise<string | null> {
  if (!thumbnailDataUrl) return null
  const res = await fetch(thumbnailDataUrl)
  const blob = await res.blob()
  const suffix = `thumb_${position}.jpg`

  const presignRes = await fetch("/api/r2/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memoryId, suffix, contentType: "image/jpeg" }),
  })
  if (!presignRes.ok) return null
  const { url, key } = (await presignRes.json()) as { url: string; key: string }

  const uploadRes = await fetch(url, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": "image/jpeg" },
  })
  if (!uploadRes.ok) return null
  return key
}

export default function NewMemoryPage() {
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const yearParam = searchParams.get("year")
  const defaultDate = yearParam ? `${yearParam}-01-01` : new Date().toISOString().slice(0, 10)

  const [title, setTitle] = useState("")
  const [date, setDate] = useState(defaultDate)
  const [description, setDescription] = useState("")
  const [countryQuery, setCountryQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null)
  const [showCountryList, setShowCountryList] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase())
  ).slice(0, 8)

  // sync country query when selection changes
  const handleSelectCountry = (c: { code: string; name: string }) => {
    setSelectedCountry(c)
    setCountryQuery(c.name)
    setShowCountryList(false)
  }

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/,$/, "")
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed])
    setTagInput("")
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim()) { setFormError("Le titre est requis."); return }
    if (!date) { setFormError("La date est requise."); return }

    startTransition(async () => {
      const tempMemoryId = crypto.randomUUID()
      const mediaInputs = []

      for (let i = 0; i < uploadFiles.length; i++) {
        const f = uploadFiles[i]
        setUploadProgress(`Upload ${i + 1} / ${uploadFiles.length}…`)
        try {
          const { storagePath, width, height } = await uploadFile(tempMemoryId, f.file, i)
          let thumbnailPath: string | null = null
          if (f.fileType === "video" && f.thumbnailUrl) {
            thumbnailPath = await uploadVideoThumbnail(tempMemoryId, f.thumbnailUrl, i)
          }
          mediaInputs.push({
            storagePath,
            thumbnailPath,
            fileType: f.fileType,
            mimeType: f.file.type,
            sizeBytes: f.file.size,
            width,
            height,
            position: i,
          })
        } catch (err) {
          setFormError(`Erreur upload fichier ${i + 1}: ${err instanceof Error ? err.message : "inconnue"}`)
          setUploadProgress(null)
          return
        }
      }

      setUploadProgress("Enregistrement…")

      // Pass the pre-generated ID via a workaround: we encode it in a tag field convention.
      // Instead, we directly call an extended version — pass tempMemoryId via a dedicated mechanism.
      // For simplicity here, createMemory will insert a fresh UUID; storage paths use tempMemoryId.
      // So we store tempMemoryId as a prefix. Adjust: pass userId+tempMemoryId so action can validate paths.
      const result = await createMemory({
        title: title.trim(),
        description,
        memoryDate: date,
        countryCode: selectedCountry?.code ?? "",
        countryName: selectedCountry?.name ?? "",
        tags,
        media: mediaInputs,
      })

      setUploadProgress(null)
      if (result && "error" in result) {
        setFormError(result.error)
      }
      // On success, createMemory calls redirect() so we never reach here
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Back */}
      <Link
        href={yearParam ? `/timeline/${yearParam}` : "/timeline"}
        className="flex items-center gap-1.5 text-sm text-[#fdf6ec]/60 hover:text-[#F4B8C1] transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Retour
      </Link>

      <div>
        <h1 className="text-3xl text-[#fdf6ec]" style={{ fontFamily: "var(--font-playfair)" }}>
          Nouveau souvenir
        </h1>
        {yearParam && (
          <p className="text-sm text-[#fdf6ec]/55 mt-1">{yearParam}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#fdf6ec]/85">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Un titre pour ce souvenir…"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#C9748A]/30 focus:border-[#C9748A]"
            required
          />
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#fdf6ec]/85">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C9748A]/30 focus:border-[#C9748A]"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#fdf6ec]/85">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Raconte ce souvenir…"
            rows={4}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] resize-none focus:outline-none focus:ring-2 focus:ring-[#C9748A]/30 focus:border-[#C9748A]"
          />
        </div>

        {/* Country */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-sm font-medium text-[#fdf6ec]/85">Pays</label>
          <div className="relative">
            <input
              type="text"
              value={countryQuery}
              onChange={(e) => {
                setCountryQuery(e.target.value)
                setSelectedCountry(null)
                setShowCountryList(true)
              }}
              onFocus={() => setShowCountryList(true)}
              onBlur={() => setTimeout(() => setShowCountryList(false), 150)}
              placeholder="Rechercher un pays…"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#C9748A]/30 focus:border-[#C9748A]"
            />
            {selectedCountry && (
              <button
                type="button"
                onClick={() => { setSelectedCountry(null); setCountryQuery("") }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#C9748A]"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {showCountryList && countryQuery && !selectedCountry && filteredCountries.length > 0 && (
            <ul className="absolute z-10 top-full mt-1 w-full bg-white border border-black/10 rounded-xl shadow-lg overflow-hidden">
              {filteredCountries.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelectCountry(c)}
                    className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F4B8C1]/20 transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#fdf6ec]/85">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag() } }}
              placeholder="Ajouter un tag…"
              className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#C9748A]/30 focus:border-[#C9748A]"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2.5 rounded-xl bg-white/5 text-sm text-[#fdf6ec]/70 hover:text-[#F4B8C1] border border-white/15 transition-colors"
            >
              Ajouter
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#F4B8C1]/20 text-[#C9748A]"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-[#1A1A1A]">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#fdf6ec]/85">Photos &amp; vidéos</label>
          <DropZone files={uploadFiles} onChange={setUploadFiles} />
        </div>

        {/* Error */}
        {formError && (
          <p className="text-sm text-red-500 rounded-xl bg-red-50 px-4 py-2.5">{formError}</p>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-[#C9748A] hover:bg-[#b5637a] disabled:opacity-60 text-white text-sm font-medium transition-colors"
          >
            {uploadProgress ?? (isPending ? "Enregistrement…" : "Enregistrer le souvenir")}
          </button>
          <Link
            href={yearParam ? `/timeline/${yearParam}` : "/timeline"}
            className="px-5 py-3 rounded-xl border border-white/15 text-sm text-[#fdf6ec]/60 hover:text-[#fdf6ec] transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
