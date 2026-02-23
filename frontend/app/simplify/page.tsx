"use client"
import { useState } from 'react'
import { simplifyText } from '../../lib/api'

export default function SimplifyPage() {
  const [text, setText] = useState('')
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)

  const go = async () => {
    if (!text) return
    setLoading(true)
    try {
      const res = await simplifyText({ text })
      setOut(res.simplified_text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Language Clarifier</h2>
        <p className="text-slate-500">Paste complex legal notices, government letters, or rules below. Our AI will break them down into simple, easy-to-read instructions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input area */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Complex Legal Text</label>
            <button
              onClick={() => setText('')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Clear
            </button>
          </div>
          <div className="glass-card overflow-hidden">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full h-[400px] p-8 text-slate-700 leading-relaxed outline-none resize-none bg-white font-serif italic text-lg border-0 focus:ring-1 focus:ring-brand-500/20"
              placeholder="Example: 'Pursuant to clause 14(b) of the revised pension act of 1993, the sub-committee hereby decrees that...'"
            />
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold transition-all ${!text || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-brand-600 text-white shadow-lg hover:bg-brand-700 active:scale-95'
                  }`}
                onClick={go}
                disabled={!text || loading}
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Processing...' : 'Clarify Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="space-y-4 h-full flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Simple Explanation</label>
          <div className="glass-card flex-1 min-h-[465px] flex flex-col">
            {!out && !loading && (
              <div className="m-auto text-center px-8">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-slate-400 font-medium">Simplified text will appear here. No more legal headaches.</p>
              </div>
            )}

            {loading && (
              <div className="m-auto flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium italic animate-pulse">Consulting AI experts...</p>
              </div>
            )}

            {out && !loading && (
              <div className="p-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-8 flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <p className="text-sm font-medium">We've broken this down into daily language and highlighted the key points for you to follow.</p>
                </div>
                <div className="text-slate-800 text-xl leading-relaxed whitespace-pre-wrap font-medium">
                  {out}
                </div>

                <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
                  <div className="flex gap-4">
                    <button className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-2">
                      Copy
                    </button>
                    <button className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-2">
                      Print
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 italic">
                    Confidence: 98%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
