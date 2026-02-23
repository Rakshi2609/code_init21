"use client"
import { useState } from 'react'
import { generateGrievance } from '../../lib/api'
import { jsPDF } from 'jspdf'

export default function GrievancePage() {
  const [form, setForm] = useState({
    scheme: 'IGNOAPS',
    last_payment: '2024-01-10',
    delay_days: 45,
    name: 'Ramesh Kumar'
  })
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const res = await generateGrievance(form as any)
      setLetter(res.letter)
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = () => {
    const doc = new jsPDF()
    const textLines = doc.splitTextToSize(letter || 'No letter generated.', 180)
    doc.text(textLines, 15, 20)
    doc.save('Grievance_Letter_SAMAAN.pdf')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Legal Grievance Assistant</h2>
        <p className="text-slate-500">We'll help you draft a professional, standard grievance letter to your nodal officer in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form area */}
        <div className="lg:col-span-4">
          <div className="glass-card p-8 sticky top-24">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs">1</span>
              Your Details
            </h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pension Scheme</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none"
                  value={form.scheme}
                  onChange={e => setForm({ ...form, scheme: e.target.value })}
                >
                  <option value="IGNOAPS">Indira Gandhi Old Age Pension (IGNOAPS)</option>
                  <option value="IGNWPS">Indira Gandhi Widow Pension (IGNWPS)</option>
                  <option value="EPF95">EPF Scheme 1995</option>
                  <option value="Railway">Railway Pension</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Last Payment Date</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none"
                  value={form.last_payment}
                  onChange={e => setForm({ ...form, last_payment: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Days of Delay</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none"
                  value={form.delay_days}
                  onChange={e => setForm({ ...form, delay_days: Number(e.target.value) })}
                />
              </div>
            </div>

            <button
              className={`w-full mt-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700'
                }`}
              onClick={submit}
              disabled={loading}
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {loading ? 'Drafting Letter...' : 'Generate Official Letter'}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Document Preview</label>
            {letter && (
              <button
                onClick={downloadPdf}
                className="text-xs font-bold bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📥</span> Download PDF
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl min-h-[700px] shadow-sm flex flex-col overflow-hidden">
            {!letter && !loading && (
              <div className="m-auto text-center p-12 max-w-sm">
                <div className="text-5xl mb-6 grayscale opacity-50">✍️</div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Ready to Draft</h4>
                <p className="text-slate-400 text-sm">Fill in your details on the left and click generate to see your professional letter.</p>
              </div>
            )}

            {loading && (
              <div className="m-auto flex flex-col items-center">
                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-brand-600 w-1/2 animate-[loading_1s_infinite]"></div>
                </div>
                <p className="text-slate-500 font-medium italic">Our AI legal assistant is drafting...</p>
                <style jsx>{`
                    @keyframes loading {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(200%); }
                    }
                 `}</style>
              </div>
            )}

            {letter && !loading && (
              <div className="p-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Formal Letter Styling */}
                <div className="font-serif text-slate-800 leading-[1.8] text-lg max-w-2xl mx-auto space-y-8">
                  <div className="border-l-4 border-slate-100 pl-8 py-2 italic text-slate-500 mb-12">
                    Official Grievance Draft - SAMAAN AI Assistant
                  </div>
                  <pre className="whitespace-pre-wrap font-serif">
                    {letter}
                  </pre>

                  <div className="mt-20 pt-12 border-t border-slate-100 flex justify-between items-end">
                    <div className="space-y-4">
                      <div className="w-32 h-px bg-slate-200"></div>
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Signature</p>
                    </div>
                    <p className="text-xs text-slate-400 italic">Generated on {new Date().toLocaleDateString()}</p>
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
