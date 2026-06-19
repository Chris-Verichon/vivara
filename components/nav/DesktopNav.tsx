"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, Globe, ImageIcon, Settings } from "lucide-react"

const NAV_ITEMS = [
  { href: "/timeline", Icon: Clock, label: "Fil du temps" },
  { href: "/world", Icon: Globe, label: "Monde" },
  { href: "/gallery", Icon: ImageIcon, label: "Galerie" },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              active ? "text-[#F4B8C1]" : "text-[#fdf6ec]/70 hover:text-[#F4B8C1]"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function SettingsNavLink() {
  const pathname = usePathname()
  const active = isActive(pathname, "/settings")

  return (
    <Link
      href="/settings"
      aria-current={active ? "page" : undefined}
      aria-label="Settings"
      className={`transition-colors ${
        active ? "text-[#F4B8C1]" : "text-[#fdf6ec]/70 hover:text-[#F4B8C1]"
      }`}
    >
      <Settings size={18} />
    </Link>
  )
}
