"use client"

import { useState, useTransition } from "react"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { DropZone, type UploadFile } from "@/components/upload/DropZone"
import { updateMemory } from "@/actions/memories"
import type { MemoryWithMedia, MediaFile } from "@/lib/types"

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getMediaUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/memories/${path}`
}

function getSupabaseClient() {
  return createBrowserClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function uploadFile(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  memoryId: string,
  file: File,
  position: number
): Promise<{ storagePath: string; width: number | null; height: number | null }> {
  const ext = file.name.split(".").pop() ?? "bin"
  const path = `${userId}/${memoryId}/${position}_${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("memories").upload(path, file, { upsert: false })
  if (error) throw new Error(error.message)

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
  return { storagePath: path, width, height }
}

async function uploadVideoThumbnail(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  memoryId: string,
  thumbnailDataUrl: string,
  position: number
): Promise<string | null> {
  if (!thumbnailDataUrl) return null
  const res = await fetch(thumbnailDataUrl)
  const blob = await res.blob()
  const path = `${userId}/${memoryId}/thumb_${position}.jpg`
  const { error } = await supabase.storage.from("memories").upload(path, blob, { contentType: "image/jpeg", upsert: false })
  if (error) return null
  return path
}

interface ExistingMedia {
  id: string
  storagePath: string
  thumbnailPath: string | null
  fileType: "image" | "video"
  previewUrl: string
}

interface Props {
  memory: MemoryWithMedia
}

export function EditMemoryForm({ memory }: Props) {
  const [isPending, startTransition] = useTransition()
  const year = memory.memory_date.slice(0, 4)

  // Existing media tracked separately
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>(
    memory.media_files.map((m: MediaFile) => ({
      id: m.id,
      storagePath: m.storage_path,
      thumbnailPath: m.thumbnail_path,
      fileType: m.file_type,
      previewUrl: getMediaUrl(m.thumbnail_path ?? m.storage_path),
    }))
  )
  const [removedPaths, setRemovedPaths] = useState<string[]>([])

  // New files to upload
  const [newFiles, setNewFiles] = useState<UploadFile[]>([])

  // Form state
  const [title, setTitle] = useState(memory.title)
  const [date, setDate] = useState(memory.memory_date)
  const [description, setDescription] = useState(memory.description ?? "")
  const [countryQuery, setCountryQuery] = useState(memory.country_name ?? "")
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(
    memory.country_code && memory.country_name
      ? { code: memory.country_code, name: memory.country_name }
      : null
  )
  const [showCountryList, setShowCountryList] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(memory.tags ?? [])
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase())
  ).slice(0, 8)

  const handleSelectCountry = (c: { code: string; name: string }) => {
    setSelectedCountry(c)
    setCountryQuery(c.name)
    setShowCountryList(false)
  }

  const removeExisting = (item: ExistingMedia) => {
    setExistingMedia((prev) => prev.filter((m) => m.id !== item.id))
    const paths = item.thumbnailPath
      ? [item.storagePath, item.thumbnailPath]
      : [item.storagePath]
    setRemovedPaths((prev) => [...prev, ...paths])
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
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setFormError("Non authentifié."); return }

      const newMediaInputs = []
      const basePosition = existingMedia.length

      for (let i = 0; i < newFiles.length; i++) {
        const f = newFiles[i]
        setUploadProgress(`Upload ${i + 1} / ${newFiles.length}…`)
        try {
          const { storagePath, width, height } = await uploadFile(supabase, user.id, memory.id, f.file, basePosition + i)
          let thumbnailPath: string | null = null
          if (f.fileType === "video" && f.thumbnailUrl) {
            thumbnailPath = await uploadVideoThumbnail(supabase, user.id, memory.id, f.thumbnailUrl, basePosition + i)
          }
          newMediaInputs.push({
            storagePath,
            thumbnailPath,
            fileType: f.fileType,
            mimeType: f.file.type,
            sizeBytes: f.file.size,
            width,
            height,
            position: basePosition + i,
          })
        } catch (err) {
          setFormError(`Erreur upload: ${err instanceof Error ? err.message : "inconnue"}`)
          setUploadProgress(null)
          return
        }
      }

      setUploadProgress("Enregistrement…")

      const result = await updateMemory(memory.id, {
        title: title.trim(),
        description,
        memoryDate: date,
        countryCode: selectedCountry?.code ?? "",
        countryName: selectedCountry?.name ?? "",
        tags,
        keepMediaIds: existingMedia.map((m) => m.id),
        newMedia: newMediaInputs,
        removedStoragePaths: removedPaths,
      })

      setUploadProgress(null)
      if (result && "error" in result) {
        setFormError(result.error)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
      <Link
        href={`/memory/${memory.id}`}
        className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Retour
      </Link>

      <div>
        <h1 className="text-3xl text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>
          Modifier le souvenir
        </h1>
        <p className="text-sm text-[#888888] mt-1">{year}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#C9748A]/30 focus:border-[#C9748A]"
            required
          />
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">Date *</label>
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
          <label className="text-sm font-medium text-[#1A1A1A]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#AAAAAA] resize-none focus:outline-none focus:ring-2 focus:ring-[#C9748A]/30 focus:border-[#C9748A]"
          />
        </div>

        {/* Country */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-sm font-medium text-[#1A1A1A]">Pays</label>
          <div className="relative">
            <input
              type="text"
              value={countryQuery}
              onChange={(e) => { setCountryQuery(e.target.value); setSelectedCountry(null); setShowCountryList(true) }}
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
          <label className="text-sm font-medium text-[#1A1A1A]">Tags</label>
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
              className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] text-sm text-[#888888] hover:text-[#C9748A] border border-black/10 transition-colors"
            >
              Ajouter
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#F4B8C1]/20 text-[#C9748A]">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-[#1A1A1A]"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Existing media */}
        {existingMedia.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#1A1A1A]">Médias existants</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {existingMedia.map((m) => (
                <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden bg-[#F5F0EA]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.previewUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(m)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    aria-label="Supprimer ce média"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New media upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1A1A1A]">Ajouter des médias</label>
          <DropZone files={newFiles} onChange={setNewFiles} />
        </div>

        {formError && (
          <p className="text-sm text-red-500 rounded-xl bg-red-50 px-4 py-2.5">{formError}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-[#C9748A] hover:bg-[#b5637a] disabled:opacity-60 text-white text-sm font-medium transition-colors"
          >
            {uploadProgress ?? (isPending ? "Enregistrement…" : "Enregistrer les modifications")}
          </button>
          <Link
            href={`/memory/${memory.id}`}
            className="px-5 py-3 rounded-xl border border-black/10 text-sm text-[#888888] hover:text-[#1A1A1A] transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
