"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, Globe, ImageIcon, Plus } from "lucide-react"

const NAV_ITEMS = [
  { href: "/timeline", Icon: Clock, label: "Timeline" },
  { href: "/world", Icon: Globe, label: "Monde" },
  { href: "/gallery", Icon: ImageIcon, label: "Galerie" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#0b0a14]/80 px-2 backdrop-blur-md md:hidden">
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-3 transition-colors ${
              active ? "text-[#F4B8C1]" : "text-[#fdf6ec]/60 hover:text-[#F4B8C1]"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}

      {/* Add memory — prominent CTA */}
      <Link
        href="/memory/new"
        className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-3 text-[#F4B8C1] transition-colors hover:text-[#e89aa9]"
        aria-label="Ajouter un souvenir"
      >
        <div className="-mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#C9748A] shadow-md transition-colors hover:bg-[#b5637a]">
          <Plus size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-medium">Ajouter</span>
      </Link>
    </nav>
  )
}
