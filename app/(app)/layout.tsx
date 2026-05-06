import { signOut } from "@/actions/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Clock, Globe, ImageIcon, Settings } from "lucide-react"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* Desktop navbar */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-[#F4B8C1]/30 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl select-none">🌻</span>
          <span
            className="text-xl text-[#C9748A]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Vivàra
          </span>
        </Link>

        <nav className="flex items-center gap-6">
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

        <div className="flex items-center gap-4">
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
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#F4B8C1]/30 flex items-center justify-around px-2 py-2 safe-area-pb">
        <Link
          href="/timeline"
          className="flex flex-col items-center gap-0.5 text-[#888888] hover:text-[#C9748A] transition-colors p-2"
        >
          <Clock size={22} />
          <span className="text-[10px]">Timeline</span>
        </Link>
        <Link
          href="/world"
          className="flex flex-col items-center gap-0.5 text-[#888888] hover:text-[#C9748A] transition-colors p-2"
        >
          <Globe size={22} />
          <span className="text-[10px]">World</span>
        </Link>
        <Link
          href="/gallery"
          className="flex flex-col items-center gap-0.5 text-[#888888] hover:text-[#C9748A] transition-colors p-2"
        >
          <ImageIcon size={22} />
          <span className="text-[10px]">Gallery</span>
        </Link>
        <Link
          href="/memory/new"
          className="flex flex-col items-center gap-0.5 bg-[#C9748A] text-white rounded-xl px-4 py-2 hover:bg-[#b5637a] transition-colors"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-[10px]">Add</span>
        </Link>
      </nav>
    </div>
  )
}
