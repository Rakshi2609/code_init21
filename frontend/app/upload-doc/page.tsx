"use client"
import { useState } from 'react'
import { ocrExtract } from '../../lib/api'

export default function UploadDoc() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!file) return
    setLoading(true)
    try {
      const res = await ocrExtract(file)
      setResult(res)
    } catch (err) {
      alert("Error extracting text. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Document Intelligence</h2>
        <p className="text-slate-500">Upload your pension slip or bank statement to automatically extract key details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Side */}
        <div className="md:col-span-1">
          <div className="glass-card p-6">
            <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-tighter">Select Document</label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 hover:border-brand-400 bg-slate-50'
                }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <div className="text-3xl mb-2">{file ? '✅' : '📤'}</div>
              <p className="text-xs font-semibold text-slate-600 truncate">
                {file ? file.name : "Click or Drag Image"}
              </p>
            </div>

            <button
              className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${!file || loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:scale-[1.02]'
                }`}
              onClick={submit}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Extract Details</span>
              )}
            </button>
          </div>
        </div>

        {/* Result Side */}
        <div className="md:col-span-2 space-y-6">
          {!result && !loading && (
            <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-medium">
              Results will appear here after processing
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[300px] glass-card p-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-brand-50 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin"></div>
              <p className="text-slate-500 font-medium">Analyzing your document with AI...</p>
            </div>
          )}

          {result && (
            <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Extraction Result</span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">Confidence: High</span>
              </div>
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Beneficiary Name</p>
                  <p className="text-lg font-bold text-slate-900">{result.name || "---"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Pension Identity</p>
                  <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">{result.pension_id || "---"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Payment Account</p>
                  <p className="text-lg font-bold text-slate-900 font-mono">{result.account_number || "---"}</p>
                </div>
              </div>

              <div className="px-8 pb-8">
                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Raw Content Summary</p>
                <div className="bg-slate-900 rounded-xl p-5 text-slate-300 text-sm font-mono overflow-auto max-h-60 leading-relaxed">
                  {result.raw_text}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
