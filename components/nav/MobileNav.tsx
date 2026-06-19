"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, Globe, ImageIcon, Plus } from "lucide-react"

const NAV_ITEMS = [
  { href: "/timeline", Icon: Clock, label: "Fil du temps" },
  { href: "/world", Icon: Globe, label: "Monde" },
  { href: "/gallery", Icon: ImageIcon, label: "Galerie" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-white/10 bg-[#0b0a14]/85 px-2 backdrop-blur-md md:hidden">
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 transition-colors ${
              active ? "text-[#F4B8C1]" : "text-[#fdf6ec]/60 hover:text-[#F4B8C1]"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}

      {/* Add memory — prominent CTA, kept inside the bar */}
      <Link
        href="/memory/new"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[#fdf6ec]/60 transition-colors hover:text-[#F4B8C1]"
        aria-label="Ajouter un souvenir"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9748A] shadow-[0_2px_10px_rgba(201,116,138,0.45)] transition-colors hover:bg-[#b5637a]">
          <Plus size={18} className="text-white" strokeWidth={2.5} />
        </span>
        <span className="text-[10px] font-medium">Ajouter</span>
      </Link>
    </nav>
  )
}
