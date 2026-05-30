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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-black/10 flex items-center justify-around px-2 pb-safe">
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-3 rounded-xl transition-colors ${
              active ? "text-[#C9748A]" : "text-[#888888] hover:text-[#C9748A]"
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
        className="flex flex-col items-center gap-0.5 px-4 py-3 rounded-xl text-[#C9748A] transition-colors hover:text-[#b5637a]"
        aria-label="Ajouter un souvenir"
      >
        <div className="w-9 h-9 rounded-full bg-[#C9748A] flex items-center justify-center shadow-md hover:bg-[#b5637a] transition-colors -mt-4">
          <Plus size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-medium">Ajouter</span>
      </Link>
    </nav>
  )
}
