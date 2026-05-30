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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar — visible on all screen sizes */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-black/10 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <LeafIcon size={24} className="text-[#C9748A]" />
          <span
            className="text-xl text-[#C9748A]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Vivàra
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/timeline"
            className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors"
          >
            <Clock size={16} />
            Timeline
          </Link>
          <Link
            href="/world"
            className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors"
          >
            <Globe size={16} />
            World
          </Link>
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors"
          >
            <ImageIcon size={16} />
            Gallery
          </Link>
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/settings"
            className="text-[#888888] hover:text-[#C9748A] transition-colors"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-[#888888] hover:text-[#C9748A] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Mobile — no burger, bottom nav handles navigation */}
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Footer */}
      <footer className="border-t border-black/10 px-8 py-4 text-center text-xs text-[#888888] hidden md:block">
        © {new Date().getFullYear()} Chris Verichon — Tous droits réservés
      </footer>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
