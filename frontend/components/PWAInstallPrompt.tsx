"use client"
import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        console.log("PWA: Install listener attached")

        const handler = (e: any) => {
            console.log("PWA: beforeinstallprompt event caught!")
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)

            // Wait for user interaction or show immediately
            const dismissed = sessionStorage.getItem('pwa-prompt-dismissed')
            if (!dismissed) {
                setShowPrompt(true)
            }
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Log current installation state
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App was installed')
            setShowPrompt(false)
        })

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log("PWA: Already running in standalone mode")
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.error("PWA: No deferred prompt available")
            return
        }

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        console.log(`PWA: User response to the install prompt: ${outcome}`)

        // We've used the prompt, and can't use it again
        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        sessionStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[22rem] z-[100] animate-in slide-in-from-bottom-4 duration-300">
            <div className="relative bg-white rounded-2xl shadow-2xl border border-[#f0ebe8] overflow-hidden">

                {/* Orange top-bar accent */}
                <div className="h-1 w-full bg-gradient-to-r from-[#fa6c38] via-[#fb8c5a] to-[#fa6c38]" />

                {/* Warm glow */}
                <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#fa6c38]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="p-5 relative">
                    <div className="flex gap-4 items-start">

                        {/* SAMAAN leaf app icon */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fa6c38] to-[#e85520] flex items-center justify-center shrink-0 shadow-lg shadow-[#fa6c38]/30">
                            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Phone body */}
                                <rect x="8" y="3" width="16" height="26" rx="3" fill="white" opacity="0.95"/>
                                {/* Screen */}
                                <rect x="10" y="7" width="12" height="14" rx="1.5" fill="#fa6c38" opacity="0.25"/>
                                {/* Home button */}
                                <circle cx="16" cy="25" r="1.5" fill="white" opacity="0.7"/>
                                {/* Download arrow */}
                                <path d="M13 11 L16 14.5 L19 11" stroke="#fa6c38" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="16" y1="8" x2="16" y2="14.5" stroke="#fa6c38" strokeWidth="1.8" strokeLinecap="round"/>
                                <line x1="12.5" y1="16" x2="19.5" y2="16" stroke="#fa6c38" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-bold text-[#fa6c38] uppercase tracking-widest mb-0.5">Add to Home Screen</p>
                                    <h4 className="font-bold text-[#181311] text-base leading-tight">SAMAAN App</h4>
                                </div>
                                <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 transition-colors mt-0.5 shrink-0">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed mt-1.5 mb-4">
                                Fast access to your pension companion — works offline too.
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleInstallClick}
                                    className="flex-1 bg-[#fa6c38] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#e85520] transition-colors shadow-md shadow-[#fa6c38]/25 active:scale-[0.97]"
                                >
                                    Install Now
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="px-4 bg-[#fff3ef] text-[#fa6c38] text-xs font-bold py-2.5 rounded-xl hover:bg-[#ffe4d9] transition-colors active:scale-[0.97]"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
