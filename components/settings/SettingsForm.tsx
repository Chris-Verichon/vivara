"use client"

import { updateSiteConfig } from "@/actions/site-config"
import { useActionState } from "react"

type Config = {
  welcome_message: string
  owner_name: string
  quote: string
  birth_year: string
}

type State = { error?: string; success?: boolean }

const initialState: State = {}

async function formAction(_prev: State, formData: FormData): Promise<State> {
  const result = await updateSiteConfig(formData)
  if (result.error) return { error: result.error }
  return { success: true }
}

export function SettingsForm({ config }: { config: Config }) {
  const [state, dispatch, isPending] = useActionState(formAction, initialState)

  return (
    <form action={dispatch} className="flex flex-col gap-8">
      {/* Owner name */}
      <fieldset className="flex flex-col gap-2">
        <label htmlFor="owner_name" className="text-sm font-medium text-[#fdf6ec]/85">
          Votre prénom
        </label>
        <input
          id="owner_name"
          name="owner_name"
          type="text"
          defaultValue={config.owner_name}
          placeholder="ex. Chris"
          maxLength={80}
          className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/5 text-sm text-[#fdf6ec] placeholder:text-[#fdf6ec]/40 focus:outline-none focus:ring-2 focus:ring-[#F4B8C1]/40 focus:border-[#F4B8C1] transition"
        />
      </fieldset>

      {/* Birth year */}
      <fieldset className="flex flex-col gap-2">
        <label htmlFor="birth_year" className="text-sm font-medium text-[#fdf6ec]/85">
          Année de naissance
        </label>
        <input
          id="birth_year"
          name="birth_year"
          type="number"
          defaultValue={config.birth_year}
          placeholder="ex. 1995"
          min={1900}
          max={new Date().getFullYear()}
          className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/5 text-sm text-[#fdf6ec] placeholder:text-[#fdf6ec]/40 focus:outline-none focus:ring-2 focus:ring-[#F4B8C1]/40 focus:border-[#F4B8C1] transition"
        />
        <p className="text-xs text-[#fdf6ec]/50">La ligne de temps commencera à cette année.</p>
      </fieldset>

      {/* Welcome message */}
      <fieldset className="flex flex-col gap-2">
        <label htmlFor="welcome_message" className="text-sm font-medium text-[#fdf6ec]/85">
          Message de bienvenue
        </label>
        <input
          id="welcome_message"
          name="welcome_message"
          type="text"
          defaultValue={config.welcome_message}
          placeholder="ex. Bienvenue dans mes souvenirs"
          maxLength={200}
          className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/5 text-sm text-[#fdf6ec] placeholder:text-[#fdf6ec]/40 focus:outline-none focus:ring-2 focus:ring-[#F4B8C1]/40 focus:border-[#F4B8C1] transition"
        />
        <p className="text-xs text-[#fdf6ec]/50">Affiché en haut de la page d&apos;accueil.</p>
      </fieldset>

      {/* Quote */}
      <fieldset className="flex flex-col gap-2">
        <label htmlFor="quote" className="text-sm font-medium text-[#fdf6ec]/85">
          Citation du jour
        </label>
        <textarea
          id="quote"
          name="quote"
          defaultValue={config.quote}
          placeholder="ex. « La vie est faite de petits moments qui font de grands souvenirs. »"
          maxLength={400}
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-white/5 text-sm text-[#fdf6ec] placeholder:text-[#fdf6ec]/40 focus:outline-none focus:ring-2 focus:ring-[#F4B8C1]/40 focus:border-[#F4B8C1] transition resize-none"
        />
        <p className="text-xs text-[#fdf6ec]/50">Affichée en bas de la page d&apos;accueil.</p>
      </fieldset>

      {/* Feedback */}
      {state.success && (
        <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          Paramètres sauvegardés avec succès.
        </p>
      )}
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-end px-8 py-3 rounded-2xl bg-[#C9748A] text-white text-sm font-medium hover:bg-[#b5637a] transition disabled:opacity-50"
      >
        {isPending ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </form>
  )
}
