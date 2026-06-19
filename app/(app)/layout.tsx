import { signOut } from "@/actions/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LeafIcon, LogOut } from "lucide-react"
import { MobileNav } from "@/components/nav/MobileNav"
import { DesktopNav, SettingsNavLink } from "@/components/nav/DesktopNav"

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
        <DesktopNav />

        {/* Desktop right actions */}
        <div className="hidden items-center gap-4 md:flex">
          <SettingsNavLink />
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-[#fdf6ec]/70 transition-colors hover:text-[#F4B8C1]"
            >
              Se déconnecter
            </button>
          </form>
        </div>

        {/* Mobile right actions — settings + sign out (bottom nav handles tabs) */}
        <div className="flex items-center gap-4 md:hidden">
          <SettingsNavLink />
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              className="flex text-[#fdf6ec]/70 transition-colors hover:text-[#F4B8C1]"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
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
