"use client"
import { useState, useEffect } from "react"

interface Props {
  label?: string
  onResult?: (fp: string) => void
}

export default function FingerprintScanner({ label = "Tap to scan", onResult }: Props) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle")
  const [scanY, setScanY] = useState(0)

  useEffect(() => {
    if (phase !== "scanning") return
    let y = 0
    let dir = 1
    const iv = setInterval(() => {
      y += dir * 3
      if (y >= 100) dir = -1
      if (y <= 0) dir = 1
      setScanY(y)
    }, 14)
    return () => clearInterval(iv)
  }, [phase])

  async function generateDeviceFingerprint(): Promise<string> {
    const signals: string[] = []

    // 1. Screen geometry
    signals.push(`${screen.width}x${screen.height}x${screen.colorDepth}`)
    signals.push(`dpr${Math.round((window.devicePixelRatio || 1) * 100)}`)

    // 2. Platform / locale / hardware
    signals.push(navigator.language || 'unknown')
    signals.push(`cpu${navigator.hardwareConcurrency || 0}`)
    signals.push(navigator.platform || 'unknown')
    signals.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')

    // 3. Canvas fingerprint — most stable signal
    try {
      const c = document.createElement('canvas')
      c.width = 220; c.height = 60
      const ctx = c.getContext('2d')!
      ctx.fillStyle = '#f80'
      ctx.fillRect(10, 5, 60, 30)
      ctx.fillStyle = '#06a'
      ctx.font = 'bold 14px Arial'
      ctx.fillText('SAMAAN fp ©', 5, 50)
      ctx.fillStyle = 'rgba(100,200,0,0.65)'
      ctx.fillText('SAMAAN fp ©', 7, 52)
      signals.push(c.toDataURL().slice(-80))
    } catch { signals.push('no-canvas') }

    // 4. Simple but stable hash
    const raw = signals.join('||')
    let h1 = 0x9e3779b9, h2 = 0x6c62272e
    for (let i = 0; i < raw.length; i++) {
      const c = raw.charCodeAt(i)
      h1 = Math.imul(h1 ^ c, 0x9f4f2906) >>> 0
      h2 = Math.imul(h2 ^ c, 0x2e1a9f4f) >>> 0
    }
    const part1 = (h1 >>> 0).toString(16).padStart(8, '0')
    const part2 = (h2 >>> 0).toString(16).padStart(8, '0')
    return `fp_${part1}${part2}`
  }

  async function handleScan() {
    if (phase === "scanning") return
    setPhase("scanning")
    setScanY(0)
    await new Promise((r) => setTimeout(r, 1800))
    setPhase("done")
    const fp = await generateDeviceFingerprint()
    onResult && onResult(fp)
    setTimeout(() => setPhase("idle"), 700)
  }

  const color =
    phase === "idle" ? "#94a3b8" : phase === "scanning" ? "#0ea5e9" : "#22c55e"

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <button onClick={handleScan} className="relative focus:outline-none" aria-label="Scan fingerprint">
        {/* pulse rings when scanning */}
        {phase === "scanning" && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-sky-400 opacity-20" />
            <span className="absolute inset-0 rounded-full animate-ping bg-sky-300 opacity-10 delay-150" />
          </>
        )}

        <div
          className="relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background:
              phase === "scanning" ? "linear-gradient(135deg,#e0f2fe,#ede9fe)"
              : phase === "done"    ? "linear-gradient(135deg,#dcfce7,#d1fae5)"
              : "#f1f5f9",
            boxShadow:
              phase === "scanning" ? `0 0 0 4px #0ea5e940`
              : phase === "done"   ? `0 0 0 4px #22c55e40`
              : "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <svg viewBox="0 0 120 120" width="90" height="90" style={{ overflow: "hidden" }}>
            {/* fingerprint ridges */}
            {[18,25,32,39,46,53,60].map((r, i) => (
              <ellipse
                key={i}
                cx="60" cy="62"
                rx={r} ry={r * 0.62}
                fill="none"
                stroke={color}
                strokeWidth="2.2"
                opacity={phase === "idle" ? 0.35 : 0.85}
                style={{ transition: "stroke 0.3s, opacity 0.3s" }}
              />
            ))}
            {/* scanning beam */}
            {phase === "scanning" && (
              <rect x="6" y={scanY + 10} width="108" height="3" rx="1.5" fill="#0ea5e9" opacity="0.75" />
            )}
            {/* done tick */}
            {phase === "done" && (
              <>
                <circle cx="60" cy="60" r="22" fill="#22c55e" opacity="0.12" />
                <path d="M49 60 L57 68 L73 51" stroke="#22c55e" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </>
            )}
          </svg>
        </div>
      </button>

      <span className="text-sm font-medium transition-colors duration-300" style={{ color }}>
        {phase === "scanning" ? "Scanning…" : phase === "done" ? "Captured ✓" : label}
      </span>
    </div>
  )
}
