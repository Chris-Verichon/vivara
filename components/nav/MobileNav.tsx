"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Clock, Globe, ImageIcon, Settings } from "lucide-react"
import { signOut } from "@/actions/auth"

const NAV_LINKS = [
  { href: "/timeline", Icon: Clock, label: "Timeline" },
  { href: "/world", Icon: Globe, label: "World" },
  { href: "/gallery", Icon: ImageIcon, label: "Gallery" },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Burger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#888888] hover:text-[#C9748A] hover:bg-black/5 transition-colors"
        aria-label="Menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Fullscreen overlay menu */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer — slides in from top */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/10 shadow-lg px-6 pt-5 pb-6 flex flex-col gap-6">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <span className="text-xl select-none">🌻</span>
                <span
                  className="text-xl text-[#C9748A]"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Vivàra
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-[#888888] hover:text-[#C9748A] hover:bg-black/5 transition-colors"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-[#1A1A1A] hover:bg-[#F4B8C1]/15 hover:text-[#C9748A] transition-colors"
                >
                  <Icon size={18} className="text-[#C9748A]" />
                  <span className="text-base">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="flex items-center justify-between pt-2 border-t border-black/5">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-[#888888] hover:text-[#C9748A] transition-colors"
              >
                <Settings size={16} />
                Paramètres
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm text-[#888888] hover:text-[#C9748A] transition-colors"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
