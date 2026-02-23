"use client"
import { useState } from "react"
import FingerprintScanner from "./FingerprintScanner"
import Toast from "./Toast"

const API = (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:8000"

export default function AuthSlider() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [stage, setStage] = useState<"scan" | "username">("scan")
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null)

  function showToast(type: string, message: string) {
    setToast({ type, message })
  }

  function switchMode(m: "login" | "register") {
    setMode(m)
    setStage("scan")
    setFingerprint(null)
  }

  async function completeRegister(e: any) {
    e.preventDefault()
    const username = (e.target.username.value as string).trim()
    if (!username || !fingerprint) {
      showToast("error", "Username and fingerprint are required")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/register/fingerprint`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, fingerprint }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.detail || "Registration failed")
      showToast("success", `Account created for ${username}!`)
      switchMode("login")
    } catch (err: any) {
      showToast("error", err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function loginWithFingerprint(fp: string) {
    setLoading(true)
    try {
      const res = await fetch(`${API}/login/fingerprint`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fingerprint: fp }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.detail || "Login failed")
      showToast("success", `Welcome back, ${j.username}!`)
    } catch (err: any) {
      showToast("error", err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const isRegister = mode === "register"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-4">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Card */}
      <div className="w-full max-w-4xl h-[560px] rounded-2xl shadow-2xl overflow-hidden flex relative bg-white">

        {/* ── Sliding overlay panel ── */}
        <div
          className="absolute inset-y-0 w-1/2 z-20 transition-transform duration-700 ease-in-out"
          style={{
            transform: isRegister ? "translateX(100%)" : "translateX(0%)",
            background: "linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)",
            borderRadius: isRegister ? "0 1rem 1rem 0" : "1rem 0 0 1rem",
          }}
        >
          <div className="flex flex-col items-center justify-center h-full px-10 text-white text-center">
            {isRegister ? (
              <>
                <div className="text-5xl mb-4">👋</div>
                <h2 className="text-3xl font-bold mb-2">Already have an account?</h2>
                <p className="text-white/75 mb-8">Log in with your fingerprint — fast &amp; secure.</p>
                <button
                  onClick={() => switchMode("login")}
                  className="px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-sky-600 transition-colors"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🔐</div>
                <h2 className="text-3xl font-bold mb-2">New here?</h2>
                <p className="text-white/75 mb-8">Register once with your fingerprint — no password needed.</p>
                <button
                  onClick={() => switchMode("register")}
                  className="px-8 py-3 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Left half: Login ── */}
        <div className="w-1/2 flex flex-col items-center justify-center px-10 gap-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Fingerprint Login</p>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          </div>
          <FingerprintScanner
            label={loading ? "Verifying…" : "Tap to scan"}
            onResult={(fp: string) => { if (!loading) loginWithFingerprint(fp) }}
          />
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Press the scanner above to authenticate instantly.
          </p>
        </div>

        {/* ── Right half: Register ── */}
        <div className="w-1/2 flex flex-col items-center justify-center px-10 gap-6">
          {stage === "scan" ? (
            <>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Step 1 of 2</p>
                <h1 className="text-2xl font-bold text-slate-800">Scan your finger</h1>
                <p className="text-sm text-slate-500 mt-1">We&apos;ll use this to identify you.</p>
              </div>
              <FingerprintScanner
                label="Tap to scan"
                onResult={(fp: string) => {
                  setFingerprint(fp)
                  setStage("username")
                  showToast("success", "Fingerprint captured!")
                }}
              />
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Step 2 of 2</p>
                <h1 className="text-2xl font-bold text-slate-800">Choose a username</h1>
                <p className="text-sm text-slate-500 mt-1">No password needed ever.</p>
              </div>
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
                  <span>✅</span>
                  <span className="font-mono truncate max-w-[160px]">{fingerprint}</span>
                </div>
              </div>
              <form onSubmit={completeRegister} className="w-full space-y-3">
                <input
                  name="username"
                  placeholder="Choose a username"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
                >
                  {loading ? "Registering…" : "Complete registration"}
                </button>
                <button
                  type="button"
                  onClick={() => setStage("scan")}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
                >
                  ← Re-scan fingerprint
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
