import { signIn } from "@/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#060510] px-4 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#C9748A]/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#1a0f1c] border border-[#C9748A]/40 flex items-center justify-center mb-4 shadow-[0_0_32px_rgba(201,116,138,0.25)]">
            <span className="text-3xl select-none">🌻</span>
          </div>
          <h1 className="text-3xl text-[#F4B8C1]" style={{ fontFamily: "var(--font-playfair)" }}>
            Vivàra
          </h1>
          <p className="text-sm text-[#fdf6ec]/45 mt-1">Ta vie, tes histoires.</p>
        </div>

        {/* Login form — glass card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-4 text-sm text-[#F4B8C1] bg-[#C9748A]/10 border border-[#C9748A]/30 rounded-lg px-4 py-3">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={signIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#fdf6ec]/80">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="toi@exemple.com"
                className="bg-white/5 border-white/15 text-[#fdf6ec] placeholder:text-[#fdf6ec]/30 focus-visible:border-[#C9748A] focus-visible:ring-[#C9748A]/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#fdf6ec]/80">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="bg-white/5 border-white/15 text-[#fdf6ec] placeholder:text-[#fdf6ec]/30 focus-visible:border-[#C9748A] focus-visible:ring-[#C9748A]/30"
              />
            </div>

            <Button
              type="submit"
              className="mt-2 w-full bg-[#C9748A] hover:bg-[#b5637a] text-white font-medium rounded-xl h-11"
            >
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
