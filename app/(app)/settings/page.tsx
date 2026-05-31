import { getSiteConfig } from "@/actions/site-config"
import { SettingsForm } from "@/components/settings/SettingsForm"

export const metadata = {
  title: "Paramètres — Vivàra",
}

export default async function SettingsPage() {
  const config = await getSiteConfig()

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1
        className="text-3xl text-[#fdf6ec] mb-2"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Paramètres
      </h1>
      <p className="text-sm text-[#fdf6ec]/55 mb-10">
        Personnalisez l&apos;apparence et le contenu de votre espace Vivàra.
      </p>

      <SettingsForm config={config} />
    </div>
  )
}
