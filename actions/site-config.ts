"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const ALLOWED_KEYS = ["welcome_message", "owner_name", "quote", "birth_year"] as const
type ConfigKey = (typeof ALLOWED_KEYS)[number]

export async function updateSiteConfig(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const updates: { key: string; value: string; updated_at: string }[] = []
  const now = new Date().toISOString()

  for (const key of ALLOWED_KEYS) {
    const raw = formData.get(key)
    if (typeof raw === "string") {
      const trimmed = raw.trim()
      // Validate birth_year
      if (key === "birth_year" && trimmed !== "") {
        const year = parseInt(trimmed, 10)
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
          return { error: "Année de naissance invalide." }
        }
      }
      updates.push({ key, value: trimmed, updated_at: now })
    }
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("site_config")
      .upsert(update, { onConflict: "key" })

    if (error) return { error: error.message }
  }

  revalidatePath("/settings")
  revalidatePath("/")
  revalidatePath("/timeline")
  return {}
}

export async function getSiteConfig(): Promise<Record<ConfigKey, string>> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("site_config")
    .select("key, value")
    .in("key", [...ALLOWED_KEYS])

  const defaults: Record<ConfigKey, string> = {
    welcome_message: "",
    owner_name: "",
    quote: "",
    birth_year: "",
  }

  if (!data) return defaults

  for (const row of data) {
    if ((ALLOWED_KEYS as readonly string[]).includes(row.key)) {
      defaults[row.key as ConfigKey] = row.value ?? ""
    }
  }

  return defaults
}
