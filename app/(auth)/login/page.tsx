import { signIn } from "@/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4">
      <div className="w-full max-w-sm">
        {/* Sunflower logo placeholder — replaced in feature/home-animation */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#F4B8C1] flex items-center justify-center mb-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <span className="text-3xl select-none">🌻</span>
          </div>
          <h1 className="text-3xl text-[#C9748A]" style={{ fontFamily: "var(--font-playfair)" }}>
            Vivàra
          </h1>
          <p className="text-sm text-[#888888] mt-1">Your life, your story.</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={signIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="border-[#F4B8C1] focus-visible:ring-[#C9748A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="border-[#F4B8C1] focus-visible:ring-[#C9748A]"
              />
            </div>

            <Button
              type="submit"
              className="mt-2 w-full bg-[#C9748A] hover:bg-[#b5637a] text-white font-medium rounded-xl h-11"
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
