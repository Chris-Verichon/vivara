import { signOut } from "@/actions/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Clock, Globe, ImageIcon, Settings, LeafIcon } from "lucide-react"
import { MobileNav } from "@/components/nav/MobileNav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="flex min-h-screen flex-col bg-night">
      {/* Navbar — nocturnal glass, visible on all screen sizes */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#0b0a14]/70 px-6 py-4 backdrop-blur-md md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <LeafIcon size={24} className="text-[#F4B8C1]" />
          <span
            className="text-xl text-[#F4B8C1]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Vivàra
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/timeline"
            className="flex items-center gap-1.5 text-sm text-[#fdf6ec]/70 transition-colors hover:text-[#F4B8C1]"
          >
            <Clock size={16} />
            Fil du temps
          </Link>
          <Link
            href="/world"
            className="flex items-center gap-1.5 text-sm text-[#fdf6ec]/70 transition-colors hover:text-[#F4B8C1]"
          >
            <Globe size={16} />
            Monde
          </Link>
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 text-sm text-[#fdf6ec]/70 transition-colors hover:text-[#F4B8C1]"
          >
            <ImageIcon size={16} />
            Galerie
          </Link>
        </nav>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/settings"
            className="text-[#fdf6ec]/70 transition-colors hover:text-[#F4B8C1]"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-[#fdf6ec]/70 transition-colors hover:text-[#F4B8C1]"
            >
              Se déconnecter
            </button>
          </form>
        </div>

        {/* Mobile — no burger, bottom nav handles navigation */}
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Footer */}
      <footer className="hidden border-t border-white/10 px-8 py-4 text-center text-xs text-[#fdf6ec]/45 md:block">
        © {new Date().getFullYear()} Chris Verichon — Tous droits réservés
      </footer>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
